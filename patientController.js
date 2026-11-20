import Patient from '../models/Patient.js';
import DietPlan from '../models/DietPlan.js';

/**
 * @desc   Get all patients
 * @route  GET /api/patients
 * @access Public
 */
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('activePlanId', 'status totals planTitle season createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
};

/**
 * @desc   Get single patient by ID (including active plan and full follow-ups)
 * @route  GET /api/patients/:id
 * @access Public
 */
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate({
        path: 'activePlanId',
        populate: { path: 'meals.food', select: 'name code category nutrition ayurveda plateColor' }
      });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient details',
      error: error.message
    });
  }
};

/**
 * @desc   Create new patient profile
 * @route  POST /api/patients
 * @access Public
 */
export const createPatient = async (req, res) => {
  try {
    const { name, age, gender, prakriti, agni, contactPhone, contactEmail, allergies, healthConditions } = req.body;

    const patient = await Patient.create({
      name,
      age,
      gender: gender || 'Female',
      prakriti: prakriti || 'Unassessed',
      agni: agni || 'Unassessed',
      contactPhone,
      contactEmail,
      allergies: allergies || [],
      healthConditions: healthConditions || []
    });

    res.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create patient profile',
      error: error.message
    });
  }
};

/**
 * @desc   Update patient profile
 * @route  PUT /api/patients/:id
 * @access Public
 */
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient profile updated',
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update patient profile',
      error: error.message
    });
  }
};

/**
 * @desc   Add a follow-up progress note (Step 8 of Prototype Flow)
 * @route  POST /api/patients/:id/follow-ups
 * @access Public
 */
export const addFollowUp = async (req, res) => {
  try {
    const { progressNote, date, weightKg, symptomsReported, recordedBy } = req.body;

    if (!progressNote) {
      return res.status(400).json({
        success: false,
        message: 'Progress note is required'
      });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    patient.followUps.unshift({
      date: date ? new Date(date) : new Date(),
      progressNote,
      weightKg,
      symptomsReported: symptomsReported || [],
      recordedBy: recordedBy || 'Practitioner'
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Follow-up note saved successfully',
      data: patient.followUps
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to save follow-up note',
      error: error.message
    });
  }
};
