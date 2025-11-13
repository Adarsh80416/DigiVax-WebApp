import Child from "../models/Child.js";
import Vaccine from "../models/Vaccine.js";
import { getVaccineStatus } from "../utils/vaccineScheduler.js";

/**
 * Get vaccine recommendations for a child
 * Calculates upcoming, completed, and missed vaccines based on DOB and vaccination history
 */
export const getVaccineRecommendations = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user.userId;
    
    // Find child and verify it belongs to the parent
    const child = await Child.findById(childId).populate("vaccinationHistory.vaccineId");
    
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }
    
    if (child.parentId.toString() !== parentId) {
      return res.status(403).json({ 
        message: "Access denied - This child does not belong to you" 
      });
    }
    
    // Get all vaccines
    const vaccines = await Vaccine.find();
    
    // Calculate recommendations for each vaccine
    const recommendations = vaccines.map(vaccine => {
      const vaccineStatus = getVaccineStatus(
        child.dateOfBirth,
        vaccine.recommendedAge,
        child.vaccinationHistory || [],
        vaccine._id
      );
      
      return {
        vaccineId: vaccine._id,
        vaccine: vaccine.name,
        description: vaccine.description,
        recommendedAge: vaccine.recommendedAge,
        dosesRequired: vaccine.dosesRequired,
        status: vaccineStatus.status,
        dueDate: vaccineStatus.dueDate
      };
    });
    
    res.status(200).json({
      child: child.name,
      childId: child._id,
      dateOfBirth: child.dateOfBirth,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

