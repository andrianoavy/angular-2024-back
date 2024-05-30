let Assignment = require('../model/assignment');
const Etudiant = require('../model/etudiant');
const ObjectId = require('mongoose').Types.ObjectId;

// Récupérer tous les assignments (GET)
/*
function getAssignments(req, res){
    Assignment.find((err, assignments) => {
        if(err){
            res.send(err)
        }

        res.send(assignments);
    });
}
*/

function getAssignmentsStudents(idEtudiant) {
    return Assignment.aggregate(
        [
            {
                $project: {
                    nom: 1,
                    dateLimite: 1,
                    matiere: 1,
                    rendus: {
                        $filter: {
                            input: '$rendus',
                            as: 'etudiant',
                            cond: {
                                $or: [
                                    { $eq: ['$$etudiant._id', idEtudiant] },
                                    { $eq: ['$$etudiant._id', ObjectId(idEtudiant)] }
                                ]
                            }
                        }
                    },
                    nonRendus: {
                        $filter: {
                            input: '$nonRendus',
                            as: 'etudiant',
                            cond: {
                                $or: [
                                    { $eq: ['$$etudiant._id', idEtudiant] },
                                    { $eq: ['$$etudiant._id', ObjectId(idEtudiant)] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    nom: 1,
                    dateLimite: 1,
                    matiere: 1,
                    etudiantData: {
                        $cond: {
                            if: { $gt: [{ $size: '$rendus' }, 0] },
                            then: {
                                rendus: true,
                                note: { $arrayElemAt: ['$rendus.note', 0] },
                                dateDeRendu: { $arrayElemAt: ['$rendus.dateDeRendu', 0] },
                                remarques: { $arrayElemAt: ['$rendus.remarques', 0] }
                            },
                            else: {
                                $cond: {
                                    if: { $gt: [{ $size: '$nonRendus' }, 0] },
                                    then: { rendus: false },
                                    else: null
                                }
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    'etudiantData.rendus': { $exists: true }
                }
            },
            {
                $project: {
                    nom: '$nom',
                    matiere: '$matiere',
                    dateLimite: '$dateLimite',
                    rendus: '$etudiantData.rendus',
                    note: '$etudiantData.note',
                    dateDeRendu: '$etudiantData.dateDeRendu',
                    remarques: '$etudiantData.remarques'
                }
            }
        ]
    );
}

function getAssignments(req, res) {
    let role = "admin";
    if (req.query['role']) {
        role = req.query['role'];
    }

    let aggregateQuery = Assignment.aggregate();

    if (role === "etudiant") {
        aggregateQuery = getAssignmentsStudents(req.query['idEtudiant']);
        console.log(aggregateQuery)
    }

    Assignment.aggregatePaginate(
        aggregateQuery,
        {
            page: parseInt(req.query.page)+1 || 1,
            limit: parseInt(req.query.limit) || 10
        },
        (err, data) => {
            if (err) {
                res.send(err)
            }

            res.send(data);
        }
    );
}

function putAnnulerNote(req, res) {
    const { assignmentId, note, dateDeRendu, remarques, ...etudiant } = req.body;
    etudiant._id = ObjectId(etudiant._id)

    Assignment.findOneAndUpdate(
        { _id: ObjectId(assignmentId) },
        {
            $pull: { rendus: { _id: ObjectId(etudiant._id) } },
            $pull: { rendus: { _id: etudiant._id } },
            $push: { nonRendus: etudiant }
        },
        { new: true, useFindAndModify: false },
        (err, data) => {
            if (err) {
                res.send(err)
            }
            res.send(data);
        }
    );
}

function putNoter(req, res) {
    const { assignmentId, ...etudiant } = req.body;
    etudiant._id = ObjectId(etudiant._id)

    if (!etudiant.dateDeRendu) {
        etudiant.dateDeRendu = Date.now();
    }
    console.log(etudiant._id);
    Assignment.findOneAndUpdate(
        { _id: ObjectId(assignmentId) },
        {
            $pull: { nonRendus: { _id: ObjectId(etudiant._id) } },
            $pull: { nonRendus: { _id: etudiant._id } },
            $push: { rendus: etudiant }
        },
        { new: true, useFindAndModify: false },
        (err, data) => {
            if (err) {
                res.send(err)
            }
            res.send(data);
        }
    );
}

// Récupérer un assignment par son id (GET)
function getAssignment(req, res) {
    let assignmentId = req.params.id;
    Assignment.findById(assignmentId, async (err, assignment) => {
        if (err) { res.send(err) }
        res.json(assignment);
    })

    /*
    Assignment.findOne({id: assignmentId}, (err, assignment) =>{
        if(err){res.send(err)}
        res.json(assignment);
    })
    */
}

// Ajout d'un assignment (POST)
async function postAssignment(req, res) {
    let assignment = new Assignment();
    assignment.nom = req.body.nom;
    assignment.matiere = req.body.matiere;
    assignment.dateLimite = req.body.dateLimite;
    assignment.rendus = req.body.rendus;
    const groups = req.body.group
    assignment.nonRendus = await Etudiant.find({ group: { $in: groups } });
    assignment.groups = groups;

    console.log("POST assignment reçu :");
    console.log(assignment)

    assignment.save((err) => {
        if (err) {
            res.send('cant post assignment ', err);
        }
        res.json({ message: `${assignment.nom} saved!` })
    })
}

// Update d'un assignment (PUT)
function updateAssignment(req, res) {
    console.log("UPDATE recu assignment : ");
    console.log(req.body);
    Assignment.findByIdAndUpdate(req.body._id, req.body, { new: true }, (err, assignment) => {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
            res.json({ message: 'updated' })
        }

        // console.log('updated ', assignment)
    });

}

// suppression d'un assignment (DELETE)
// l'id est bien le _id de mongoDB
function deleteAssignment(req, res) {

    Assignment.findByIdAndRemove(req.params.id, (err, assignment) => {
        if (err) {
            res.send(err);
        }
        res.json({ message: `${assignment.nom} deleted` });
    })
}



module.exports = { getAssignments, postAssignment, getAssignment, updateAssignment, deleteAssignment, putNoter, putAnnulerNote };
