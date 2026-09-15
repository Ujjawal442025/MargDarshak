// Authority Command Center Mock Intelligence & Telemetry Engine
// Compliant with SIH26204 Problem Statement & Rajasthan Tourism Baseline Data

export const authorityKPIs = {
  totalDestinations: 113,
  highCrowdCount: 8,
  criticalCrowdCount: 3,
  activeEventsCount: 12,
  activeIncidentsCount: 6,
  systemStatus: "OPERATIONAL"
};

export const initialIncidents = [
  {
    id: "INC-101",
    severity: "CRITICAL",
    siteId: "RJ_AMBER_FORT",
    siteName: "Amber Fort",
    location: "Gate 1 / Suraj Pol, Jaipur",
    time: "4 mins ago",
    title: "Projected Crowd Threshold Breach",
    description: "Inflow exceeds entry turnstile capacity by +16 people/min. Parking zone B at 94% occupancy.",
    riskIndicators: {
      crowdDensity: "HIGH",
      flowStability: "LOW",
      queuePressure: "CRITICAL"
    },
    suggestedAction: "Redirect incoming bus arrivals toward Gate 2 and mobilize 3 perimeter crowd marshals."
  },
  {
    id: "INC-102",
    severity: "HIGH",
    siteId: "RJ_JAIPUR_OLD_CITY",
    siteName: "Jaipur Old City",
    location: "Badi Chaupar to Hawa Mahal Corridor",
    time: "12 mins ago",
    title: "Traffic Gridlock & Tourist Transit Surge",
    description: "Vehicle speeds reduced to 6 km/h. E-rickshaw bottleneck causing tourist pedestrian spillover.",
    riskIndicators: {
      crowdDensity: "HIGH",
      flowStability: "MEDIUM",
      queuePressure: "HIGH"
    },
    suggestedAction: "Deploy 4 traffic wardens at Ajmeri Gate intersection and activate temporary pedestrian-only zone."
  },
  {
    id: "INC-103",
    severity: "CRITICAL",
    siteId: "RJ_KHATU_SHYAM",
    siteName: "Khatu Shyam",
    location: "Darshan Holding Area 2, Sikar",
    time: "18 mins ago",
    title: "High Pilgrim Holding Queue",
    description: "Holding barricade queue length reaching 1,840 pilgrims. Wait time approaching 45 minutes.",
    riskIndicators: {
      crowdDensity: "CRITICAL",
      flowStability: "LOW",
      queuePressure: "CRITICAL"
    },
    suggestedAction: "Open parallel holding channel C and distribute water sachets at outer security perimeter."
  },
  {
    id: "INC-104",
    severity: "MODERATE",
    siteId: "RJ_JAISALMER_FORT",
    siteName: "Jaisalmer Fort",
    location: "Gopa Chowk Ramp Entrance",
    time: "26 mins ago",
    title: "Narrow Ramp Inflow Surge",
    description: "Bicycle and tourist convergence on living fort ascent. Minor slowing of pedestrian clearance.",
    riskIndicators: {
      crowdDensity: "MODERATE",
      flowStability: "MEDIUM",
      queuePressure: "MODERATE"
    },
    suggestedAction: "Restrict vehicular loading and post 2 wardens at entrance ramp choke point."
  },
  {
    id: "INC-105",
    severity: "HIGH",
    siteId: "RJ_PUSHKAR",
    siteName: "Pushkar Lake Ghats",
    location: "Brahma Ghat & Varaha Ghat",
    time: "34 mins ago",
    title: "Fair Influx & Evening Aarti Congestion",
    description: "Tourist and pilgrim influx converging on lake stairs. Local accommodation reaching 96% occupancy.",
    riskIndicators: {
      crowdDensity: "HIGH",
      flowStability: "MEDIUM",
      queuePressure: "HIGH"
    },
    suggestedAction: "Institute one-way pedestrian circulation between Brahma Temple and Brahma Ghat."
  },
  {
    id: "INC-106",
    severity: "MODERATE",
    siteId: "RJ_CITY_PALACE_UDAIPUR",
    siteName: "City Palace Udaipur",
    location: "Badi Pol Courtyard Ticket Line",
    time: "41 mins ago",
    title: "Ticket Counter Queue Spurt",
    description: "Wait time surged to 28 mins due to 3 chartered tour buses arriving simultaneously.",
    riskIndicators: {
      crowdDensity: "MODERATE",
      flowStability: "HIGH",
      queuePressure: "MODERATE"
    },
    suggestedAction: "Direct group tour guides to automated QR scan counter 3."
  }
];

export const mockDestinationTelemetry = {
  RJ_AMBER_FORT: {
    siteId: "RJ_AMBER_FORT",
    siteName: "Amber Fort",
    city: "Jaipur",
    zone: "Gate 1 / Suraj Pol",
    currentCrowdPct: 82,
    trend: "RISING",
    forecast15m: 87,
    forecast30m: 94,
    forecast45m: 96,
    forecast60m: 91,
    status: "HIGH",
    confidence: "87%",
    flow: {
      peopleCurrently: 642,
      enteringPerMin: 34,
      leavingPerMin: 18,
      netAccumulationPerMin: 16,
      density: "HIGH",
      queueLength: 71,
      estimatedWaitMin: 24,
      capacityUtilization: 82
    },
    factors: [
      { name: "Entry Rate Surge", score: 88, status: "Critical" },
      { name: "Parking Saturation (Zone B)", score: 94, status: "Near Full" },
      { name: "Charter Bus Arrival Convoys", score: 80, status: "Active" },
      { name: "Weather Comfort", score: 76, status: "Pleasant (High Demand)" }
    ],
    resources: {
      current: { security: 12, traffic: 4, medical: 2 },
      recommended: { security: 15, traffic: 7, medical: 3 },
      donorSite: "Jaigarh Fort",
      donorSiteChanges: { security: "8 → 6", traffic: "3 → 2" },
      reason: "Predicted threshold breach in 22 minutes at Suraj Pol."
    },
    simulation: {
      gate1Closed: {
        gate2Crowd: { current: 61, simulated: 84 },
        mainQueue: { current: 71, simulated: 103 },
        waitTimeMin: { current: 24, simulated: 39 },
        roadCongestion: { current: "Medium", simulated: "High" },
        medicalDemand: { current: 2, simulated: 3 }
      }
    }
  },
  RJ_CITY_PALACE_UDAIPUR: {
    siteId: "RJ_CITY_PALACE_UDAIPUR",
    siteName: "City Palace Udaipur",
    city: "Udaipur",
    zone: "Badi Pol Ticket Courtyard",
    currentCrowdPct: 81,
    trend: "RISING",
    forecast15m: 85,
    forecast30m: 91,
    forecast45m: 89,
    forecast60m: 80,
    status: "HIGH",
    confidence: "89%",
    flow: {
      peopleCurrently: 512,
      enteringPerMin: 28,
      leavingPerMin: 15,
      netAccumulationPerMin: 13,
      density: "HIGH",
      queueLength: 54,
      estimatedWaitMin: 19,
      capacityUtilization: 81
    },
    factors: [
      { name: "Lakeside Ghat Influx", score: 85, status: "High" },
      { name: "Boat Jetty Queue Spillover", score: 78, status: "Moderate" },
      { name: "Wedding Heritage Season", score: 75, status: "Active" },
      { name: "Comfort Index", score: 82, status: "Favorable" }
    ],
    resources: {
      current: { security: 10, traffic: 3, medical: 2 },
      recommended: { security: 13, traffic: 5, medical: 2 },
      donorSite: "Fateh Sagar Lake",
      donorSiteChanges: { security: "6 → 4", traffic: "3 → 2" },
      reason: "Badi Pol queue building up prior to midday museum surge."
    },
    simulation: {
      gate1Closed: {
        gate2Crowd: { current: 55, simulated: 79 },
        mainQueue: { current: 54, simulated: 86 },
        waitTimeMin: { current: 19, simulated: 31 },
        roadCongestion: { current: "Medium", simulated: "High" },
        medicalDemand: { current: 2, simulated: 2 }
      }
    }
  },
  RJ_KHATU_SHYAM: {
    siteId: "RJ_KHATU_SHYAM",
    siteName: "Khatu Shyam",
    city: "Sikar",
    zone: "Toran Dwar & Holding Queue",
    currentCrowdPct: 92,
    trend: "CRITICAL",
    forecast15m: 96,
    forecast30m: 98,
    forecast45m: 95,
    forecast60m: 88,
    status: "CRITICAL",
    confidence: "93%",
    flow: {
      peopleCurrently: 1840,
      enteringPerMin: 85,
      leavingPerMin: 42,
      netAccumulationPerMin: 43,
      density: "CRITICAL",
      queueLength: 195,
      estimatedWaitMin: 45,
      capacityUtilization: 92
    },
    factors: [
      { name: "Ekadashi / Weekend Darshan", score: 98, status: "Maximum" },
      { name: "Highway Toll Congestion", score: 89, status: "High Inflow" },
      { name: "Foot Pilgrim Processions", score: 82, status: "Heavy" },
      { name: "Aarti Peak Window", score: 94, status: "Imminent" }
    ],
    resources: {
      current: { security: 24, traffic: 12, medical: 6 },
      recommended: { security: 32, traffic: 18, medical: 9 },
      donorSite: "Jeenmata Temple",
      donorSiteChanges: { security: "10 → 6", traffic: "6 → 3" },
      reason: "Holding area capacity exceeded; pilgrim queue extending to outer loop."
    },
    simulation: {
      gate1Closed: {
        gate2Crowd: { current: 85, simulated: 99 },
        mainQueue: { current: 195, simulated: 290 },
        waitTimeMin: { current: 45, simulated: 75 },
        roadCongestion: { current: "High", simulated: "Severe Gridlock" },
        medicalDemand: { current: 6, simulated: 12 }
      }
    }
  },
  RJ_MEHRANGARH_FORT: {
    siteId: "RJ_MEHRANGARH_FORT",
    siteName: "Mehrangarh Fort",
    city: "Jodhpur",
    zone: "Fateh Pol & Jai Pol Ramp",
    currentCrowdPct: 68,
    trend: "MODERATE",
    forecast15m: 74,
    forecast30m: 79,
    forecast45m: 76,
    forecast60m: 65,
    status: "MODERATE",
    confidence: "88%",
    flow: {
      peopleCurrently: 380,
      enteringPerMin: 22,
      leavingPerMin: 16,
      netAccumulationPerMin: 6,
      density: "MODERATE",
      queueLength: 28,
      estimatedWaitMin: 11,
      capacityUtilization: 68
    },
    factors: [
      { name: "Elevator Lift Throughput", score: 72, status: "Normal" },
      { name: "Ramp Ascent Flow", score: 65, status: "Steady" },
      { name: "Weather Comfort", score: 74, status: "Pleasant" }
    ],
    resources: {
      current: { security: 10, traffic: 4, medical: 2 },
      recommended: { security: 10, traffic: 4, medical: 2 },
      donorSite: "Umaid Bhawan Palace",
      donorSiteChanges: { security: "Stable", traffic: "Stable" },
      reason: "Balanced operations under optimal capacity thresholds."
    },
    simulation: {
      gate1Closed: {
        gate2Crowd: { current: 48, simulated: 67 },
        mainQueue: { current: 28, simulated: 49 },
        waitTimeMin: { current: 11, simulated: 21 },
        roadCongestion: { current: "Low", simulated: "Moderate" },
        medicalDemand: { current: 2, simulated: 2 }
      }
    }
  },
  RJ_JAISALMER_FORT: {
    siteId: "RJ_JAISALMER_FORT",
    siteName: "Jaisalmer Fort",
    city: "Jaisalmer",
    zone: "Gopa Chowk Gateway",
    currentCrowdPct: 87,
    trend: "RISING",
    forecast15m: 90,
    forecast30m: 93,
    forecast45m: 88,
    forecast60m: 76,
    status: "HIGH",
    confidence: "91%",
    flow: {
      peopleCurrently: 710,
      enteringPerMin: 36,
      leavingPerMin: 21,
      netAccumulationPerMin: 15,
      density: "HIGH",
      queueLength: 64,
      estimatedWaitMin: 22,
      capacityUtilization: 87
    },
    factors: [
      { name: "Living Fort Residential Influx", score: 88, status: "High" },
      { name: "Sunset Viewpoint Transit", score: 92, status: "Surging" },
      { name: "Heritage Bazaar Density", score: 86, status: "Congested" }
    ],
    resources: {
      current: { security: 8, traffic: 3, medical: 2 },
      recommended: { security: 12, traffic: 5, medical: 3 },
      donorSite: "Desert National Park",
      donorSiteChanges: { security: "6 → 4", traffic: "3 → 2" },
      reason: "Ascent ramp bottleneck approaching maximum pedestrian load."
    },
    simulation: {
      gate1Closed: {
        gate2Crowd: { current: 70, simulated: 91 },
        mainQueue: { current: 64, simulated: 110 },
        waitTimeMin: { current: 22, simulated: 42 },
        roadCongestion: { current: "Medium", simulated: "High" },
        medicalDemand: { current: 2, simulated: 4 }
      }
    }
  }
};

export function getAuthoritySiteTelemetry(siteId) {
  return mockDestinationTelemetry[siteId] || mockDestinationTelemetry["RJ_AMBER_FORT"];
}
