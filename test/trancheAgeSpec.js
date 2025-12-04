process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const should = chai.should();
const app = require('../index');
const TrancheAge = require('../api/models/tranche-age-model');
const { connectToDatabase } = require('./utils/db-connection');

chai.use(chaiHttp);

describe('========== TEST TRANCHE AGE ==========', function () {
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
            await TrancheAge.deleteMany({});
        } catch (error) {
            console.error('Error cleaning database:', error);
        }
    });

    describe('POST /tranche-age', () => {
        it('devrait retourner une liste vide quand il n\'y a pas de tranches d\'âge', async function () {
            const res = await chai.request(app)
                .post('/test/tranche-age/list');

            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('ret').equal(0);
            res.body.should.have.property('data');
            res.body.data.should.be.an('array');
            res.body.data.should.have.lengthOf(0);
        });

        it('devrait retourner la liste des tranches d\'âge', async function () {
            const tranchesAge = [
                { nom: "0-3 ans", life_cycle: 0, code: "0_TO_3" },
                { nom: "3-6 ans", life_cycle: 0, code: "3_TO_6" },
                { nom: "6-12 ans", life_cycle: 0, code: "6_TO_12" }
            ];

            await TrancheAge.insertMany(tranchesAge);

            const res = await chai.request(app)
                .post('/test/tranche-age/list');

            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('ret').equal(0);
            res.body.should.have.property('data');
            res.body.data.should.be.an('array');
            res.body.data.should.have.lengthOf(3);

            const noms = res.body.data.map(tranche => tranche.nom).sort();
            expect(noms).to.deep.equal(['0-3 ans', '3-6 ans', '6-12 ans']);
        });

        it('devrait exclure les tranches d\'âge supprimées (life_cycle = 9)', async function () {
            const tranchesAge = [
                { nom: "0-3 ans", life_cycle: 0, code: "0_TO_3" },
                { nom: "3-6 ans", life_cycle: 9, code: "3_TO_6" },
                { nom: "6-12 ans", life_cycle: 0, code: "6_TO_12" }
            ];

            await TrancheAge.insertMany(tranchesAge);

            const res = await chai.request(app)
                .post('/test/tranche-age/list');

            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('ret').equal(0);
            res.body.should.have.property('data');
            res.body.data.should.be.an('array');
            res.body.data.should.have.lengthOf(2);

            const noms = res.body.data.map(tranche => tranche.nom).sort();
            expect(noms).to.deep.equal(['0-3 ans', '6-12 ans']);
        });
    });
});
