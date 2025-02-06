import Evaluation from "../models/evaluation.js";
import Medecin from "../models/Medecin.js";
import Structure from "../models/Structure.js";
import User from "../models/user.js";


export const submitEvaluation = async (req, res) => {
    try {
        const { missionId, evaluatorId, evaluateeId, role, punctuality, competence, communication, comment, averageRating } = req.body;
        
        const newEvaluation = new Evaluation({
            mission: missionId,
            evaluator: evaluatorId,
            evaluatee: evaluateeId,
            role,
            punctuality,
            competence,
            communication,
            overallEvaluation: averageRating,
            comment,
        });

        await newEvaluation.save();

        // Update the evaluatee's overall rating
        await updateEvaluateeRating(evaluateeId, role);
        res.status(201).json({ message: 'Évaluation soumise avec succès!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la soumission de l'évaluation." });
    }
};

export const getAverageRating = async (req, res) => {
    try {
        const { evaluateeId } = req.params;

        const evaluations = await Evaluation.find({ evaluatee: evaluateeId });

        if (!evaluations.length) {
            return res.status(404).json({ message: 'Aucune évaluation trouvée pour cet évalué.' });
        }

        const totalRatings = evaluations.reduce((acc, evala) => ({
            punctuality: acc.punctuality + evala.punctuality,
            competence: acc.competence + evala.competence,
            communication: acc.communication + evala.communication,
        }), { punctuality: 0, competence: 0, communication: 0 });

        const averageRating = {
            punctuality: (totalRatings.punctuality / evaluations.length).toFixed(2),
            competence: (totalRatings.competence / evaluations.length).toFixed(2),
            communication: (totalRatings.communication / evaluations.length).toFixed(2),
            overall: ((totalRatings.punctuality + totalRatings.competence + totalRatings.communication) / (3 * evaluations.length)).toFixed(2),
        };

        res.status(200).json(averageRating);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la note moyenne.' });
    }
};
export const getComments = async (req, res) => {
    try {
        const { evaluateeId } = req.params;

        const evaluations = await Evaluation.find({ evaluatee: evaluateeId });
        if (!evaluations.length) {
            return res.status(404).json({ message: 'Aucune commentaire trouvée pour cet évalué.' });
        }

        // Loop through evaluations and find evaluator details for each one
        const evaluationsWithEvaluator = await Promise.all(
            evaluations.map(async (evaluation) => {
                const evaluatorUser = await User.findById(evaluation.evaluator);
                
                let evaluator;
                if (evaluatorUser?.role === "medecin") {
                    evaluator = await Medecin.findOne({ user: evaluatorUser._id }).select();
                } else if (evaluatorUser?.role === "structure") {
                    evaluator = await Structure.findOne({ user: evaluatorUser._id });
                }

                return {
                    ...evaluation.toObject(),  // Convert Mongoose document to plain object
                    evaluator,
                };
            })
        );

        res.status(200).json(evaluationsWithEvaluator);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération commentaire.' });
    }
};


const updateEvaluateeRating = async (evaluateeId, role) => {
    try {
        const evaluations = await Evaluation.find({ evaluatee: evaluateeId });

        if (evaluations.length === 0) {
            console.log("No evaluations found for this user.");
            return;
        }

        const totalRatings = evaluations.reduce((acc, evala) => ({
            punctuality: acc.punctuality + evala.punctuality,
            competence: acc.competence + evala.competence,
            communication: acc.communication + evala.communication,
        }), { punctuality: 0, competence: 0, communication: 0 });

        const averageRating = {
            punctuality: (totalRatings.punctuality / evaluations.length).toFixed(2),
            competence: (totalRatings.competence / evaluations.length).toFixed(2),
            communication: (totalRatings.communication / evaluations.length).toFixed(2),
            overall: ((totalRatings.punctuality + totalRatings.competence + totalRatings.communication) / (3 * evaluations.length)).toFixed(2),
        };

        let evaluatee;
        if (role === "structure") {
            evaluatee = await Medecin.findOne({user:evaluateeId});
        } else {
            evaluatee = await Structure.findOne({user:evaluateeId});
        }


        if (evaluatee) {
            evaluatee.overallRating = averageRating.overall;
            await evaluatee.save();
            console.log("Updated overall rating for evaluatee:", averageRating);
        }
    } catch (error) {
        console.error("Error updating evaluatee rating:", error);
    }
};