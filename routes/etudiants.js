let Etudiant = require('../model/etudiant');

// Récupérer tous les etudiants (GET)
/*
function getEtudiants(req, res){
    Etudiant.find((err, etudiants) => {
        if(err){
            res.send(err)
        }

        res.send(etudiants);
    });
}
*/

function getEtudiants(req, res){
    let aggregateQuery = Etudiant.aggregate();

    Etudiant.aggregatePaginate(
        aggregateQuery, 
        {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        },
        (err, data) => {
            if(err){
                res.send(err)
            }

            res.send(data);
        }
    );
}

// Récupérer un etudiant par son id (GET)
function getEtudiant(req, res){
    let etudiantId = req.params.id;
    Etudiant.findById(etudiantId, (err, etudiant) =>{
        if(err){res.send(err)}
        res.json(etudiant);
    })

    /*
    Etudiant.findOne({id: etudiantId}, (err, etudiant) =>{
        if(err){res.send(err)}
        res.json(etudiant);
    })
    */
}

// Ajout d'un etudiant (POST)
function postEtudiant(req, res){
    let etudiant = new Etudiant();
    etudiant.id = req.body.id;
    etudiant.nom = req.body.nom;
    etudiant.group = req.body.group;

    console.log("POST etudiant reçu :");
    console.log(etudiant)

    etudiant.save( (err) => {
        if(err){
            res.send('cant post etudiant ', err);
        }
        res.json({ message: `${etudiant.nom} saved!`})
    })
}

// Update d'un etudiant (PUT)
function updateEtudiant(req, res) {
    console.log("UPDATE recu etudiant : ");
    console.log(req.body);
    Etudiant.findByIdAndUpdate(req.body._id, req.body, {new: true}, (err, etudiant) => {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
          res.json({message: 'updated'})
        }

      // console.log('updated ', etudiant)
    });

}

// suppression d'un etudiant (DELETE)
// l'id est bien le _id de mongoDB
function deleteEtudiant(req, res) {

    Etudiant.findByIdAndRemove(req.params.id, (err, etudiant) => {
        if (err) {
            res.send(err);
        }
        res.json({message: `${etudiant.nom} deleted`});
    })
}



module.exports = { getEtudiants, postEtudiant, getEtudiant, updateEtudiant, deleteEtudiant };
