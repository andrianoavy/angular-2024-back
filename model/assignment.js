let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

let AssignmentSchema = Schema({
    nom: String,
    matiere: Object,
    dateLimite: Date,
    rendus: Array,
    nonRendus:Array,
    groups:Array|undefined
});

/*
 *{"nom":"test65",
"dateLimite":"2024-05-30T21:00:00.000Z",
"matiere":{"_id":"6657f86abaed2da104346032",
"nom":"Developpement web",
"responsable":"Michel Buffa",
"__v":0},
"rendus":[],
"nonRendus":[],
"group":["G5"]}
 * */

AssignmentSchema.plugin(mongoosePaginate);

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
// assignment est le nom de la collection dans la base de données
// Mongoose tolère certaines erreurs dans le nom (ex: Assignent au lieu de assignments)
module.exports = mongoose.model('assignments', AssignmentSchema);
