let Matiere = require('../model/matiere');

// Récupérer tous les matieres (GET)
/*
function getMatieres(req, res){
    Matiere.find((err, matieres) => {
        if(err){
            res.send(err)
        }

        res.send(matieres);
    });
}
*/

function getMatieres(req, res) {
    let aggregateQuery = Matiere.aggregate();
    if (req.query['search']) {
        const searchText = req.query['search'];
        if (req.query['no-paging']) {
            filterMatieres(res, searchText);
            return;
        }

        aggregateQuery = Matiere.aggregate([{
            $match: {
                $or: [
                    { nom: { $regex: searchText, $options: 'i' } },
                    { responsable: { $regex: searchText, $options: 'i' } }
                ]
            }
        }
        ]);
    }

    Matiere.aggregatePaginate(
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

function filterMatieres(res, searchText) {
    Matiere.find({
        $or: [
            { nom: { $regex: searchText, $options: 'i' } },
            { responsable: { $regex: searchText, $options: 'i' } }
        ]
    }
        , (err, data) => {
            if (err) {
                res.send(err)
            }
            res.send(data);
        }).limit(3);
}

// Récupérer un matiere par son id (GET)
function getMatiere(req, res) {
    let matiereId = req.params.id;
    Matiere.findById(matiereId, (err, matiere) => {
        if (err) { res.send(err) }
        res.json(matiere);
    })

    /*
    Matiere.findOne({id: matiereId}, (err, matiere) =>{
        if(err){res.send(err)}
        res.json(matiere);
    })
    */
}

// Ajout d'un matiere (POST)
function postMatiere(req, res) {
    let matiere = new Matiere();
    matiere.id = req.body.id;
    matiere.nom = req.body.nom;
    matiere.responsable = req.body.responsable;

    console.log("POST matiere reçu :");
    console.log(matiere)

    matiere.save((err) => {
        if (err) {
            res.send('cant post matiere ', err);
        }
        res.json({ message: `${matiere.nom} saved!` })
    })
}

// Update d'un matiere (PUT)
function updateMatiere(req, res) {
    console.log("UPDATE recu matiere : ");
    console.log(req.body);
    Matiere.findByIdAndUpdate(req.body._id, req.body, { new: true }, (err, matiere) => {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
            res.json({ message: 'updated' })
        }

        // console.log('updated ', matiere)
    });

}

// suppression d'un matiere (DELETE)
// l'id est bien le _id de mongoDB
function deleteMatiere(req, res) {

    Matiere.findByIdAndRemove(req.params.id, (err, matiere) => {
        if (err) {
            res.send(err);
        }
        res.json({ message: `${matiere.nom} deleted` });
    })
}



module.exports = { getMatieres, postMatiere, getMatiere, updateMatiere, deleteMatiere };
