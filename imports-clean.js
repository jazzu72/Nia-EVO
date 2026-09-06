const express = require('express');
const path = require('path');
const fs = require('fs');

const PropertyManager = require('./property-manager');
const GovernessDeployment = require('./governess-deployment');
const MercuryAPI = require('./mercury-api');   // ⭐ ONLY API KEY YOU NEED
const FacebookDeals = require('./facebook-deals');
const ClosingEngine = require('./closing-engine');
