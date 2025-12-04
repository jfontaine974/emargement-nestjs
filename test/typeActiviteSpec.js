process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const should = chai.should();
const app = require('../index');
const TypeActivite = require('../api/models/type-activite-model');
const { connectToDatabase } = require('./utils/db-connection');

chai.use(chaiHttp);

describe('TypeActivite', function () {
    this.timeout(30000);

    before(async function () {
        if (process.env.NODE_ENV != 'test') {
            console.error('NODE_ENV!=test !');
            process.exit(1);
        }
        await connectToDatabase();
    });

    beforeEach(async function () {
        try {
            await TypeActivite.deleteMany({});
        } catch (error) {
            console.error('Error cleaning database:', error);
        }
    });

    describe('POST /api/type-activite/list', () => {
        it('should return all active type activites', async function () {
            try {
                // Créer les données de test
                await TypeActivite.create({
                    nom: 'Activité 1',
                    code: 'ACT1',
                    life_cycle: 0
                });

                await TypeActivite.create({
                    nom: 'Activité 2',
                    code: 'ACT2',
                    life_cycle: 0
                });

                await TypeActivite.create({
                    nom: 'Activité 3',
                    code: 'ACT3',
                    life_cycle: 1 // Ce type d'activité ne doit pas être retourné
                });

                // Faire la requête
                const res = await chai.request(app)
                    .post('/test/type-activite/list');


                // Assertions
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('ret').eql(0);
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.length.should.be.eql(2);

                // Vérifier que seuls les éléments avec life_cycle=0 sont retournés
                const returnedCodes = res.body.data.map(item => item.code).sort();
                returnedCodes.should.deep.equal(['ACT1', 'ACT2'].sort());
            } catch (error) {
                console.error('Test error:', error);
                throw error;
            }
        });
    });

    describe('TypeActivite model', () => {
        it('should not create a type activite without required fields', async function () {
            try {
                const typeActivite = new TypeActivite({
                    // Manque le champ 'nom'
                    code: 'TEST'
                });
                await typeActivite.save();
                // Si on arrive ici, le test échoue
                expect.fail('Should have thrown ValidationError');
            } catch (error) {
                error.should.be.an('error');
                error.errors.should.have.property('nom');
            }
        });
    });
});