import { Router } from 'express';
import * as propertiesRepo from "../../App/PropertiesRepo.js"

var router = Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const laForetData = propertiesRepo.readProperties("laForetProperties");
  const ImmoDuParticulierData = propertiesRepo.readProperties("ImmoDuParticulier");
  const orpiPropertiesData = propertiesRepo.readProperties("orpiProperties");

  const agencies = [{
    name: "La Foret",
    properties: laForetData
  },{
    name: "Immo Du Particulier",
    properties: ImmoDuParticulierData
  },{
    name: "Orpi",
    properties: orpiPropertiesData
  }]

  res.render('index', { title: 'Home in France Scraper' , agenciesData: agencies});
});

export default router;
