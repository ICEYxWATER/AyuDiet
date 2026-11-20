import DietPlan from '../models/DietPlan.js';
import Patient from '../models/Patient.js';
import Food from '../models/Food.js';

/**
 * Helper: Scale per-100g nutrient to portion in grams
 * Formula from Hackathon Slide 3: oats 180 g × 71 kcal ÷ 100 = 128 kcal
 */
const scaleNutrient = (per100g, grams) => {
  return Math.round((per100g * grams) / 100 * 10) / 10;
};

/**
 * @desc   Get active diet plan for a patient
 * @route  GET /api/plans/patient/:patientId
 * @access Public
 */
export const getPlanByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    let plan = await DietPlan.findOne({ patient: patientId })
      .populate('meals.food', 'name code category nutrition ayurveda plateColor')
      .sort({ updatedAt: -1 });

    if (!plan) {
      // Create default draft plan if none exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      plan = await DietPlan.create({
        patient: patientId,
        planTitle: `Diet Plan for ${patient.name}`,
        targetPrakriti: patient.prakriti,
        status: 'Draft',
        meals: []
      });

      patient.activePlanId = plan._id;
      await patient.save();
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient diet plan',
      error: error.message
    });
  }
};

/**
 * @desc   Create or update a meal plan (Any modification resets status to 'Draft')
 * @route  POST /api/plans
 * @access Public
 */
export const saveOrUpdatePlan = async (req, res) => {
  try {
    const { patientId, planId, planTitle, season, practitionerNotes, rawMeals } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'patientId is required' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Process and auto-calculate meals from dual-metric food data
    const processedMeals = [];
    if (Array.isArray(rawMeals)) {
      for (const item of rawMeals) {
        const { mealType, foodId, grams } = item;
        const portion = Number(grams) || 100;

        // Find food in MongoDB
        const foodDoc = await Food.findById(foodId);
        if (!foodDoc) continue;

        const scaledEnergy = scaleNutrient(foodDoc.nutrition.calories, portion);
        const scaledProtein = scaleNutrient(foodDoc.nutrition.protein, portion);
        const scaledCarbs = scaleNutrient(foodDoc.nutrition.carbs, portion);
        const scaledFat = scaleNutrient(foodDoc.nutrition.fat, portion);

        processedMeals.push({
          mealType: mealType || 'Lunch',
          food: foodDoc._id,
          foodCode: foodDoc.code,
          foodName: foodDoc.name,
          grams: portion,
          scaledEnergy,
          scaledProtein,
          scaledCarbs,
          scaledFat,
          rasa: (foodDoc.ayurveda.rasa || []).join(', '),
          virya: foodDoc.ayurveda.virya || '',
          plateColor: foodDoc.plateColor || '#9da96b'
        });
      }
    }

    let plan;
    if (planId) {
      plan = await DietPlan.findById(planId);
    }

    if (plan) {
      // Update existing plan - resets to Draft per prototype rules
      plan.planTitle = planTitle || plan.planTitle;
      plan.season = season || plan.season;
      plan.targetPrakriti = patient.prakriti;
      plan.practitionerNotes = practitionerNotes !== undefined ? practitionerNotes : plan.practitionerNotes;
      plan.meals = processedMeals;
      plan.status = 'Draft'; // Editing automatically resets to Draft
      plan.approvedAt = null;
      plan.approvedBy = null;
      await plan.save();
    } else {
      // Create new plan
      plan = await DietPlan.create({
        patient: patientId,
        planTitle: planTitle || `Ayurvedic Diet Chart - ${patient.name}`,
        season: season || 'All Season',
        targetPrakriti: patient.prakriti,
        practitionerNotes: practitionerNotes || '',
        meals: processedMeals,
        status: 'Draft'
      });

      patient.activePlanId = plan._id;
      await patient.save();
    }

    const populatedPlan = await DietPlan.findById(plan._id).populate(
      'meals.food',
      'name code category nutrition ayurveda plateColor'
    );

    res.status(200).json({
      success: true,
      message: 'Diet plan saved as Draft',
      data: populatedPlan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to save diet plan',
      error: error.message
    });
  }
};

/**
 * @desc   Approve a diet plan (Step 7: Unlocks PDF / Print)
 * @route  PUT /api/plans/:id/approve
 * @access Public
 */
export const approvePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const plan = await DietPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    if (plan.meals.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve an empty meal plan. Add at least one food item.'
      });
    }

    plan.status = 'Approved';
    plan.approvedAt = new Date();
    plan.approvedBy = approvedBy || 'Ayurvedic Dietitian';
    await plan.save();

    res.json({
      success: true,
      message: 'Diet plan approved successfully! PDF export and sharing unlocked.',
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve plan',
      error: error.message
    });
  }
};
