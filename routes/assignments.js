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

function getAssignmentsStudents() { }

function getAssignments(req, res) {
    let role = "admin";
    if (req.query['role']) {
        role = req.query['role'];
    }

    let aggregateQuery = Assignment.aggregate();

    Assignment.aggregatePaginate(
        aggregateQuery,
        {
            page: parseInt(req.query.page) || 1,
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

    Assignment.findOneAndUpdate(
        { _id: ObjectId(assignmentId) },
        {
            $pull: { rendus: { _id: ObjectId(etudiant._id) } },
            $pull: { rendus: { _id:etudiant._id } },
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
    if(!etudiant.dateDeRendu) {
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
    Assignment.findById(assignmentId, (err, assignment) => {
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



module.exports = { getAssignments, postAssignment, getAssignment, updateAssignment, deleteAssignment, putNoter , putAnnulerNote};
