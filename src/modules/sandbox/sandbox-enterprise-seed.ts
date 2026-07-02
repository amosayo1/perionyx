import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";

const DEPARTMENTS = [
  { id: "dept-manufacturing", name: "Manufacturing", busUnit: "Manufacturing" },
  { id: "dept-procurement", name: "Procurement", busUnit: "Procurement" },
  { id: "dept-treasury", name: "Treasury", busUnit: "Treasury" },
  { id: "dept-finance", name: "Finance", busUnit: "Finance" },
  { id: "dept-compliance", name: "Compliance", busUnit: "Compliance" },
  { id: "dept-risk", name: "Risk Management", busUnit: "Risk" },
  { id: "dept-technology", name: "Technology", busUnit: "Technology" },
  { id: "dept-sales", name: "Sales", busUnit: "Sales" },
  { id: "dept-operations", name: "Operations", busUnit: "Operations" },
  { id: "dept-legal", name: "Legal", busUnit: "Legal" },
  { id: "dept-hr", name: "Human Resources", busUnit: "Human Resources" },
  { id: "dept-engineering", name: "Engineering", busUnit: "Technology" },
  { id: "dept-logistics", name: "Logistics", busUnit: "Operations" },
  { id: "dept-audit", name: "Internal Audit", busUnit: "Compliance" },
  { id: "dept-accounts-payable", name: "Accounts Payable", busUnit: "Finance" },
  { id: "dept-accounts-receivable", name: "Accounts Receivable", busUnit: "Finance" },
  { id: "dept-quality", name: "Quality Assurance", busUnit: "Manufacturing" },
  { id: "dept-research", name: "R&D", busUnit: "Technology" },
  { id: "dept-marketing", name: "Marketing", busUnit: "Sales" },
  { id: "dept-tax", name: "Tax", busUnit: "Finance" },
];

const OFFICES = [
  "Dubai HQ", "London", "Frankfurt", "Lagos", "Singapore", "New York", "Mumbai", "Shanghai",
];

const USERS_DATA = [
  { name: "Karim Al-Mansoori", title: "Chief Executive Officer", dept: "dept-manufacturing", office: "Dubai HQ" },
  { name: "Fatima Nasser", title: "Chief Financial Officer", dept: "dept-finance", office: "Dubai HQ" },
  { name: "Omar Sulaiman", title: "Group Treasurer", dept: "dept-treasury", office: "Dubai HQ" },
  { name: "Layla Hassan", title: "Assistant Treasurer", dept: "dept-treasury", office: "London" },
  { name: "Rashid Khan", title: "Senior Treasury Analyst", dept: "dept-treasury", office: "Dubai HQ" },
  { name: "Priya Sharma", title: "Treasury Analyst", dept: "dept-treasury", office: "Singapore" },
  { name: "Ahmed Ibrahim", title: "Treasury Analyst", dept: "dept-treasury", office: "Dubai HQ" },
  { name: "James Mitchell", title: "Finance Manager - EMEA", dept: "dept-finance", office: "London" },
  { name: "Chen Wei", title: "Finance Manager - APAC", dept: "dept-finance", office: "Singapore" },
  { name: "Maria Santos", title: "Group Controller", dept: "dept-finance", office: "Dubai HQ" },
  { name: "David Thompson", title: "VP of Compliance", dept: "dept-compliance", office: "London" },
  { name: "Aisha Bakari", title: "Chief Risk Officer", dept: "dept-risk", office: "Dubai HQ" },
  { name: "Sanjay Patel", title: "Head of Internal Audit", dept: "dept-audit", office: "Dubai HQ" },
  { name: "Elena Petrova", title: "IT Director", dept: "dept-technology", office: "London" },
  { name: "Mohammed Al-Rashid", title: "VP of Manufacturing", dept: "dept-manufacturing", office: "Dubai HQ" },
  { name: "Thomas Mueller", title: "Head of Procurement", dept: "dept-procurement", office: "Frankfurt" },
  { name: "Sarah Connor", title: "VP of Sales", dept: "dept-sales", office: "New York" },
  { name: "Raj Gupta", title: "Head of Operations", dept: "dept-operations", office: "Mumbai" },
  { name: "Sophie Bernard", title: "General Counsel", dept: "dept-legal", office: "London" },
  { name: "Amara Okafor", title: "HR Director", dept: "dept-hr", office: "Lagos" },
  { name: "Kwame Asante", title: "Treasury Operations Manager", dept: "dept-treasury", office: "Lagos" },
  { name: "Liam O'Brien", title: "Senior Treasury Analyst", dept: "dept-treasury", office: "New York" },
  { name: "Yuki Tanaka", title: "Treasury Analyst", dept: "dept-treasury", office: "Singapore" },
  { name: "Olivia Chen", title: "Accounts Payable Manager", dept: "dept-accounts-payable", office: "Singapore" },
  { name: "Ali Hassan", title: "Accounts Receivable Manager", dept: "dept-accounts-receivable", office: "Dubai HQ" },
  { name: "Robert Fischer", title: "Risk Analyst", dept: "dept-risk", office: "Frankfurt" },
  { name: "Nadia Volkov", title: "Compliance Officer", dept: "dept-compliance", office: "London" },
  { name: "Carlos Mendez", title: "Internal Auditor", dept: "dept-audit", office: "New York" },
  { name: "Amina Diallo", title: "Compliance Analyst", dept: "dept-compliance", office: "Lagos" },
  { name: "Vikram Singh", title: "Risk Analyst", dept: "dept-risk", office: "Mumbai" },
  { name: "Hannah Weber", title: "Payroll Manager", dept: "dept-accounts-payable", office: "Frankfurt" },
  { name: "Mia Johansson", title: "Treasury Accountant", dept: "dept-treasury", office: "London" },
  { name: "Dmitri Ivanov", title: "Financial Analyst", dept: "dept-finance", office: "New York" },
  { name: "Fatima Zahra", title: "Senior Accountant", dept: "dept-finance", office: "Dubai HQ" },
  { name: "Pedro Alves", title: "Tax Manager", dept: "dept-tax", office: "London" },
  { name: "Siti Rahma", title: "Tax Analyst", dept: "dept-tax", office: "Singapore" },
  { name: "Andrew Kim", title: "Engineering Lead", dept: "dept-engineering", office: "Singapore" },
  { name: "Leila Bouaziz", title: "Software Engineer", dept: "dept-engineering", office: "Dubai HQ" },
  { name: "Patrick Okafor", title: "DevOps Engineer", dept: "dept-engineering", office: "Lagos" },
  { name: "Ingrid Larsen", title: "Logistics Manager", dept: "dept-logistics", office: "Frankfurt" },
  { name: "Hiroshi Yamamoto", title: "Supply Chain Analyst", dept: "dept-logistics", office: "Singapore" },
  { name: "Grace Osei", title: "Procurement Officer", dept: "dept-procurement", office: "Lagos" },
  { name: "Felix Wagner", title: "Procurement Analyst", dept: "dept-procurement", office: "Frankfurt" },
  { name: "John Smith", title: "Sales Director - Americas", dept: "dept-sales", office: "New York" },
  { name: "Nina Petrova", title: "Sales Director - EMEA", dept: "dept-sales", office: "London" },
  { name: "Li Mei", title: "Sales Director - APAC", dept: "dept-sales", office: "Shanghai" },
  { name: "Oluwaseun Adeyemi", title: "Regional Sales Manager - Africa", dept: "dept-sales", office: "Lagos" },
  { name: "Maria Hernandez", title: "Marketing Director", dept: "dept-marketing", office: "New York" },
  { name: "Johan de Vries", title: "Quality Manager", dept: "dept-quality", office: "Frankfurt" },
  { name: "Aya Nakamura", title: "R&D Engineer", dept: "dept-research", office: "Singapore" },
  { name: "Chidi Eze", title: "Manufacturing Supervisor", dept: "dept-manufacturing", office: "Lagos" },
  { name: "Klaus Schmidt", title: "Plant Manager - Frankfurt", dept: "dept-manufacturing", office: "Frankfurt" },
  { name: "Rajesh Kumar", title: "Plant Manager - Mumbai", dept: "dept-manufacturing", office: "Mumbai" },
  { name: "Tariq Abdullah", title: "Operations Analyst", dept: "dept-operations", office: "Dubai HQ" },
  { name: "Eva Kowalski", title: "Legal Counsel", dept: "dept-legal", office: "Frankfurt" },
  { name: "Chloe Martin", title: "HR Business Partner", dept: "dept-hr", office: "London" },
  { name: "Daniel Ochieng", title: "IT Support Lead", dept: "dept-technology", office: "Lagos" },
  { name: "Sasha Kuznetsov", title: "Network Administrator", dept: "dept-technology", office: "New York" },
  { name: "Fatima Bilal", title: "Data Analyst", dept: "dept-technology", office: "Dubai HQ" },
  { name: "Bjorn Eriksson", title: "Security Engineer", dept: "dept-technology", office: "London" },
  { name: "Deepa Nair", title: "QA Engineer", dept: "dept-quality", office: "Mumbai" },
  { name: "Kofi Mensah", title: "Logistics Coordinator", dept: "dept-logistics", office: "Lagos" },
  { name: "Isabella Rossi", title: "Marketing Manager", dept: "dept-marketing", office: "London" },
  { name: "Wei Zhang", title: "Supply Chain Director", dept: "dept-logistics", office: "Shanghai" },
  { name: "Ahmed El-Sayed", title: "Internal Auditor", dept: "dept-audit", office: "Dubai HQ" },
  { name: "Maria Kowalczyk", title: "Compliance Analyst", dept: "dept-compliance", office: "Frankfurt" },
  { name: "Samuel Jackson", title: "Accountant - AP", dept: "dept-accounts-payable", office: "New York" },
  { name: "Rita Fernandes", title: "Accountant - AR", dept: "dept-accounts-receivable", office: "Dubai HQ" },
  { name: "Takahiro Sato", title: "Financial Analyst", dept: "dept-finance", office: "Tokyo" },
  { name: "Nasreen Begum", title: "Treasury Intern", dept: "dept-treasury", office: "Mumbai" },
  { name: "Omar Farouk", title: "Operations Manager", dept: "dept-operations", office: "Dubai HQ" },
];

function generateUsers(count: number): { name: string; title: string; dept: string; office: string }[] {
  const titles = [
    "Analyst", "Senior Analyst", "Associate", "Senior Associate", "Manager",
    "Senior Manager", "Director", "Senior Director", "Coordinator", "Specialist",
    "Lead Specialist", "Executive Assistant", "Officer", "Supervisor", "Team Lead",
  ];
  const firstNames = [
    "Adam", "Beth", "Chris", "Diana", "Edward", "Fiona", "George", "Helen",
    "Ian", "Julia", "Kevin", "Laura", "Michael", "Nora", "Oscar", "Paula",
    "Quinn", "Rachel", "Steven", "Tina", "Umar", "Victoria", "Walter", "Xena",
    "Yuri", "Zara", "Alex", "Bianca", "Carl", "Dana", "Erik", "Freya",
    "Gavin", "Holly", "Issac", "Jade", "Kurt", "Lena", "Malik", "Nina",
    "Orlando", "Piper", "Rex", "Sage", "Theo", "Uma", "Vince", "Willa",
    "Amir", "Beatrice", "Cedric", "Dahlia", "Emil", "Farah", "Gideon", "Hana",
    "Idris", "Josie", "Kian", "Lilith", "Miles", "Nadia", "Odin", "Paloma",
    "Quinton", "Ramona", "Stefan", "Talia", "Ulysses", "Vera", "Wyatt", "Xia",
    "Yasir", "Zoe", "Asher", "Blake", "Colin", "Dev", "Elise", "Finn",
    "Gemma", "Hugo", "Iris", "Jasper", "Kai", "Lara", "Milo", "Nova",
  ];
  const lastNames = [
    "Anderson", "Brown", "Clark", "Davis", "Evans", "Foster", "Garcia", "Harris",
    "Irwin", "Johnson", "King", "Lee", "Miller", "Nelson", "Owens", "Parker",
    "Quinn", "Reed", "Smith", "Taylor", "Upton", "Vega", "Walker", "Xu",
    "Young", "Zhang", "Abbott", "Bishop", "Cole", "Dixon", "Ellis", "Fox",
    "Grant", "Hayes", "Ivey", "James", "Knight", "Lane", "Marsh", "Nash",
    "Oliver", "Pierce", "Quincy", "Reese", "Stone", "Tate", "Underwood", "Vance",
    "Wade", "York", "Zimmerman", "Armstrong", "Bradley", "Crawford", "Douglas",
    "Elliott", "Ferguson", "Gibson", "Hamilton", "Ingram", "Jenkins", "Keller",
    "Lambert", "Manning", "Nichols", "O'Neill", "Patterson", "Ramirez", "Simmons",
    "Tucker", "Valdez", "Wallace", "Wells", "Zamora",
  ];
  const people: { name: string; title: string; dept: string; office: string }[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const office = OFFICES[i % OFFICES.length];
    const titleIndex = i > 180 ? i % titles.length : (i > 120 ? i % (titles.length - 2) : (i > 60 ? i % (titles.length - 4) : i % (titles.length - 6)));
    people.push({
      name: `${firstName} ${lastName}`,
      title: titles[titleIndex],
      dept: dept.id,
      office,
    });
  }
  return people;
}

const CURRENCIES = ["USD", "AED", "EUR", "GBP", "JPY", "NGN"];

const FX_RATES: Record<string, Record<string, number>> = {
  USD: { AED: 3.6725, EUR: 0.9200, GBP: 0.7900, JPY: 149.50, NGN: 1540.00 },
  AED: { USD: 0.2723, EUR: 0.2505, GBP: 0.2151, JPY: 40.71, NGN: 419.40 },
  EUR: { USD: 1.0870, AED: 3.9920, GBP: 0.8587, JPY: 162.50, NGN: 1674.00 },
  GBP: { USD: 1.2658, AED: 4.6480, EUR: 1.1645, JPY: 189.20, NGN: 1956.00 },
  JPY: { USD: 0.00669, AED: 0.02456, EUR: 0.00615, GBP: 0.00529, NGN: 10.30 },
  NGN: { USD: 0.00065, AED: 0.00238, EUR: 0.00060, GBP: 0.00051, JPY: 0.0971 },
};

const BANK_ACCOUNTS = [
  { name: "ADCB Business Checking - AED", currency: "AED", balance: 12400000, type: "Operating", accountNumber: "AE120030012345678901" },
  { name: "ADCB Payroll Account - AED", currency: "AED", balance: 3200000, type: "Payroll", accountNumber: "AE120030012345678902" },
  { name: "Chase USD Operating", currency: "USD", balance: 8250000, type: "Operating", accountNumber: "****4567" },
  { name: "Chase USD Payroll", currency: "USD", balance: 1800000, type: "Payroll", accountNumber: "****4568" },
  { name: "HSBC EUR Operating", currency: "EUR", balance: 5200000, type: "Operating", accountNumber: "GB33HSBC12345678901" },
  { name: "HSBC GBP Operating", currency: "GBP", balance: 2800000, type: "Operating", accountNumber: "GB33HSBC12345678902" },
  { name: "Deutsche Bank EUR Reserve", currency: "EUR", balance: 8500000, type: "Treasury Reserve", accountNumber: "DE89370400440532013000" },
  { name: "Standard Chartered USD Reserve", currency: "USD", balance: 15000000, type: "Treasury Reserve", accountNumber: "SG18SCBL12345678901" },
  { name: "MUFG JPY Account", currency: "JPY", balance: 125000000, type: "Operating", accountNumber: "JP1234567890123456" },
  { name: "Access Bank NGN Account", currency: "NGN", balance: 850000000, type: "Operating", accountNumber: "NG123456789012345" },
  { name: "ADCB Investment Account - AED", currency: "AED", balance: 25000000, type: "Investment", accountNumber: "AE120030012345678903" },
  { name: "DBS USD Receivables", currency: "USD", balance: 4200000, type: "Receivables", accountNumber: "SG12DBS12345678901" },
  { name: "Barclays USD Settlement", currency: "USD", balance: 3100000, type: "Settlement", accountNumber: "GB12BARC12345678901" },
  { name: "First Abu Dhabi Bank AED Tax", currency: "AED", balance: 5800000, type: "Tax", accountNumber: "AE120030012345678904" },
];

const VENDOR_COMPANIES = [
  { name: "SteelSphere Industries", country: "UAE", risk: "LOW" },
  { name: "Precision Alloys LLC", country: "UAE", risk: "LOW" },
  { name: "GulfTech Components", country: "UAE", risk: "LOW" },
  { name: "Emirates Raw Materials", country: "UAE", risk: "MEDIUM" },
  { name: "Dubai Metalworks Factory", country: "UAE", risk: "LOW" },
  { name: "Continental Machinery GmbH", country: "Germany", risk: "LOW" },
  { name: "IndustrieTechnik AG", country: "Germany", risk: "LOW" },
  { name: "RheinMetall Components", country: "Germany", risk: "LOW" },
  { name: "Bavarian Precision Parts", country: "Germany", risk: "MEDIUM" },
  { name: "British Engineering Solutions", country: "UK", risk: "LOW" },
  { name: "Manchester Industrial Supply", country: "UK", risk: "LOW" },
  { name: "Sheffield Steel UK Ltd", country: "UK", risk: "LOW" },
  { name: "Lancashire Tooling Co", country: "UK", risk: "MEDIUM" },
  { name: "American Industrial Corp", country: "USA", risk: "LOW" },
  { name: "Midwest Manufacturing Supply", country: "USA", risk: "LOW" },
  { name: "Texas Oil & Gas Equipment", country: "USA", risk: "MEDIUM" },
  { name: "Detroit Auto Parts Inc", country: "USA", risk: "LOW" },
  { name: "Shenzhen Electronics Co", country: "China", risk: "MEDIUM" },
  { name: "Shanghai Precision Machinery", country: "China", risk: "LOW" },
  { name: "Guangzhou Industrial Supply", country: "China", risk: "MEDIUM" },
  { name: "Osaka Steel Works", country: "Japan", risk: "LOW" },
  { name: "Tokyo Precision Instruments", country: "Japan", risk: "LOW" },
  { name: "Yokohama Chemical Supply", country: "Japan", risk: "LOW" },
  { name: "Lagos Steel Fabricators", country: "Nigeria", risk: "HIGH" },
  { name: "African Mining Supplies", country: "Nigeria", risk: "HIGH" },
  { name: "Nigerian Industrial Works", country: "Nigeria", risk: "MEDIUM" },
  { name: "Mumbai Industrial Products", country: "India", risk: "MEDIUM" },
  { name: "Bangalore Tech Components", country: "India", risk: "LOW" },
  { name: "Chennai Manufacturing Hub", country: "India", risk: "MEDIUM" },
  { name: "Delhi Steel Traders", country: "India", risk: "MEDIUM" },
  { name: "CloudScale Technologies", country: "USA", risk: "LOW" },
  { name: "DataVault Systems", country: "USA", risk: "LOW" },
  { name: "NetSecure Cyber Inc", country: "UK", risk: "LOW" },
  { name: "Enterprise Software GmbH", country: "Germany", risk: "LOW" },
  { name: "Global IT Solutions Pte", country: "Singapore", risk: "LOW" },
  { name: "Allen & Overton Legal", country: "UK", risk: "LOW" },
  { name: "Al Maktoum Legal Consultants", country: "UAE", risk: "LOW" },
  { name: "Sharma & Associates Law", country: "India", risk: "MEDIUM" },
  { name: "McKinsey & Partners ME", country: "UAE", risk: "LOW" },
  { name: "BCG Dubai Consulting", country: "UAE", risk: "LOW" },
  { name: "Deloitte Corporate Finance", country: "UAE", risk: "LOW" },
  { name: "PwC Middle East", country: "UAE", risk: "LOW" },
  { name: "KPMG Advisory Services", country: "UAE", risk: "LOW" },
  { name: "Maersk Gulf Logistics", country: "UAE", risk: "LOW" },
  { name: "DP World Shipping", country: "UAE", risk: "LOW" },
  { name: "FedEx Trade Networks", country: "USA", risk: "LOW" },
  { name: "DHL Global Forwarding", country: "Germany", risk: "LOW" },
  { name: "Kuehne+Nagel Logistics", country: "Switzerland", risk: "LOW" },
  { name: "AXA Gulf Insurance", country: "UAE", risk: "LOW" },
  { name: "Zurich Insurance ME", country: "UAE", risk: "LOW" },
  { name: "Lloyd's of London Syndicate", country: "UK", risk: "LOW" },
  { name: "Chubb Insurance Group", country: "USA", risk: "LOW" },
  { name: "Etisalat Enterprise", country: "UAE", risk: "LOW" },
  { name: "Du Telecom Business", country: "UAE", risk: "LOW" },
  { name: "Vodafone Global Enterprise", country: "UK", risk: "LOW" },
  { name: "AT&T Business Solutions", country: "USA", risk: "LOW" },
  { name: "G4S Security Services UAE", country: "UAE", risk: "LOW" },
  { name: "Transguard Security LLC", country: "UAE", risk: "LOW" },
  { name: "ADNOC Industrial Supplies", country: "UAE", risk: "LOW" },
  { name: "Borealis Chemicals", country: "UAE", risk: "MEDIUM" },
  { name: "SABIC Middle East", country: "Saudi Arabia", risk: "LOW" },
  { name: "BASF Regional Supply", country: "Germany", risk: "LOW" },
  { name: "Dow Chemical ME FZE", country: "UAE", risk: "MEDIUM" },
  { name: "Siemens Energy Gulf", country: "UAE", risk: "LOW" },
  { name: "ABB Industrial Automation", country: "Germany", risk: "LOW" },
  { name: "Schneider Electric ME", country: "UAE", risk: "LOW" },
  { name: "Honeywell Process Solutions", country: "USA", risk: "LOW" },
  { name: "Rockwell Automation", country: "USA", risk: "LOW" },
  { name: "CAT Global Parts", country: "USA", risk: "LOW" },
  { name: "Komatsu Middle East", country: "UAE", risk: "LOW" },
  { name: "Hitachi Construction ME", country: "UAE", risk: "LOW" },
  { name: "Volvo Trucks Middle East", country: "UAE", risk: "LOW" },
  { name: "Scania Middle East", country: "UAE", risk: "LOW" },
  { name: "Shell Lubricants ME", country: "UAE", risk: "LOW" },
  { name: "ExxonMobil Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "TotalEnergies Trading", country: "France", risk: "LOW" },
  { name: "BP Middle East Supply", country: "UAE", risk: "LOW" },
  { name: "3M Gulf Limited", country: "UAE", risk: "LOW" },
  { name: "GE Vernova Gulf", country: "UAE", risk: "LOW" },
  { name: "Johnson Controls ME", country: "UAE", risk: "LOW" },
  { name: "Caterpillar Gulf", country: "UAE", risk: "LOW" },
  { name: "Parker Hannifin ME", country: "UAE", risk: "LOW" },
  { name: "Bosch Rexroth Gulf", country: "UAE", risk: "LOW" },
  { name: "Eaton Industrial ME", country: "UAE", risk: "LOW" },
  { name: "Emerson Process ME", country: "UAE", risk: "LOW" },
  { name: "Endress+Hauser Gulf", country: "UAE", risk: "LOW" },
  { name: "Yokogawa Middle East", country: "UAE", risk: "LOW" },
  { name: "Cummins Middle East", country: "UAE", risk: "LOW" },
  { name: "Perkins Engines Gulf", country: "UAE", risk: "LOW" },
  { name: "Atlas Copco Gulf", country: "UAE", risk: "LOW" },
  { name: "Ingersoll Rand ME", country: "UAE", risk: "LOW" },
  { name: "Sulzer Pumps Gulf", country: "UAE", risk: "LOW" },
  { name: "Grundfos Middle East", country: "UAE", risk: "LOW" },
  { name: "Alfa Laval Gulf", country: "UAE", risk: "LOW" },
  { name: "Sandvik Mining ME", country: "UAE", risk: "LOW" },
  { name: "Metso Outotec Gulf", country: "UAE", risk: "LOW" },
  { name: "FLSmidth Middle East", country: "UAE", risk: "LOW" },
  { name: "ThyssenKrupp Industrial", country: "Germany", risk: "LOW" },
  { name: "Voith Hydro Gulf", country: "UAE", risk: "LOW" },
  { name: "Andritz Separation Gulf", country: "UAE", risk: "LOW" },
  { name: "GEA Group Gulf", country: "UAE", risk: "LOW" },
  { name: "AkzoNobel Paints ME", country: "UAE", risk: "LOW" },
  { name: "PPG Industries Gulf", country: "UAE", risk: "LOW" },
  { name: "Jotun Paints ME", country: "UAE", risk: "LOW" },
  { name: "Hempel Coatings Gulf", country: "UAE", risk: "LOW" },
  { name: "Avery Dennison Gulf", country: "UAE", risk: "LOW" },
  { name: "Henkel Adhesives ME", country: "UAE", risk: "LOW" },
  { name: "Sika Gulf Limited", country: "UAE", risk: "LOW" },
  { name: "Rockwool Middle East", country: "UAE", risk: "LOW" },
  { name: "Saint-Gobain Gulf", country: "UAE", risk: "LOW" },
  { name: "Knauf Insulation ME", country: "UAE", risk: "LOW" },
  { name: "Tata Steel International", country: "India", risk: "LOW" },
  { name: "ArcelorMittal Dubai", country: "UAE", risk: "LOW" },
  { name: "Nucor International Trading", country: "USA", risk: "LOW" },
  { name: "POSCO International", country: "South Korea", risk: "LOW" },
  { name: "JFE Steel Corporation", country: "Japan", risk: "LOW" },
  { name: "Nippon Steel Trading", country: "Japan", risk: "LOW" },
  { name: "Hyundai Steel Gulf", country: "UAE", risk: "LOW" },
  { name: "Baosteel Middle East", country: "UAE", risk: "LOW" },
  { name: "China Minmetals Gulf", country: "UAE", risk: "MEDIUM" },
  { name: "Glencore International", country: "Switzerland", risk: "MEDIUM" },
  { name: "Trafigura Gulf FZE", country: "UAE", risk: "MEDIUM" },
  { name: "Vitol Middle East", country: "UAE", risk: "MEDIUM" },
  { name: "Mercuria Energy Trading", country: "UAE", risk: "MEDIUM" },
  { name: "Gunvor Group Dubai", country: "UAE", risk: "MEDIUM" },
  { name: "Cargill Metals Supply", country: "USA", risk: "LOW" },
  { name: "Louis Dreyfus Commodities", country: "Netherlands", risk: "LOW" },
  { name: "Bunge International Trading", country: "USA", risk: "LOW" },
  { name: "Wilmar International", country: "Singapore", risk: "LOW" },
  { name: "Olam International", country: "Singapore", risk: "MEDIUM" },
  { name: "Al Ghurair Metals", country: "UAE", risk: "LOW" },
  { name: "Al Futtaim Industrial", country: "UAE", risk: "LOW" },
  { name: "Al Tayer Supplies", country: "UAE", risk: "LOW" },
  { name: "Majid Al Futtaim Holdings", country: "UAE", risk: "LOW" },
  { name: "Chalhoub Group Supply", country: "UAE", risk: "LOW" },
  { name: "Al Habtoor Trading", country: "UAE", risk: "LOW" },
  { name: "Bin Laden Group Supply", country: "Saudi Arabia", risk: "MEDIUM" },
  { name: "Saudi Aramco Supply Chain", country: "Saudi Arabia", risk: "LOW" },
  { name: "QatarEnergy Trading", country: "Qatar", risk: "LOW" },
  { name: "ADQ Industrial Supplies", country: "UAE", risk: "LOW" },
  { name: "Mubadala Industrial", country: "UAE", risk: "LOW" },
  { name: "Investcorp Industrial", country: "Bahrain", risk: "LOW" },
  { name: "Awal Gulf Manufacturing", country: "Bahrain", risk: "LOW" },
  { name: "Oman Industrial Supplies", country: "Oman", risk: "LOW" },
  { name: "Kuwait National Industrial", country: "Kuwait", risk: "LOW" },
  { name: "Al Zour Refinery Supply", country: "Kuwait", risk: "LOW" },
  { name: "Qatar Steel International", country: "Qatar", risk: "LOW" },
  { name: "Bahrain Steel BSC", country: "Bahrain", risk: "LOW" },
  { name: "Sohar Industrial Port Supply", country: "Oman", risk: "LOW" },
  { name: "Ruwais Industrial Complex", country: "UAE", risk: "LOW" },
  { name: "Khalifa Industrial Zone Supply", country: "UAE", risk: "LOW" },
  { name: "JAFZA Trading Company", country: "UAE", risk: "LOW" },
  { name: "Dubai South Logistics Hub", country: "UAE", risk: "LOW" },
  { name: "Abu Dhabi Ports Supply", country: "UAE", risk: "LOW" },
  { name: "Fujairah Oil Terminal Supply", country: "UAE", risk: "LOW" },
  { name: "RAK Ceramics Supply", country: "UAE", risk: "LOW" },
  { name: "Arkan Building Materials", country: "UAE", risk: "LOW" },
  { name: "Emirates Steel Arkan", country: "UAE", risk: "LOW" },
  { name: "Dubai Cable Company", country: "UAE", risk: "LOW" },
  { name: "National Cable Systems", country: "UAE", risk: "LOW" },
  { name: "ABB Electrical Industries", country: "Saudi Arabia", risk: "LOW" },
  { name: "Siemens Saudi Arabia", country: "Saudi Arabia", risk: "LOW" },
  { name: "Schneider Saudi Arabia", country: "Saudi Arabia", risk: "LOW" },
  { name: "Alfanar Industrial", country: "Saudi Arabia", risk: "LOW" },
  { name: "Bahra Electric Company", country: "Saudi Arabia", risk: "LOW" },
  { name: "Eaton Electric Saudi", country: "Saudi Arabia", risk: "LOW" },
  { name: "Legrand Saudi Arabia", country: "Saudi Arabia", risk: "LOW" },
  { name: "Hager Gulf Distribution", country: "UAE", risk: "LOW" },
  { name: "Gulf Cables & Electrical", country: "Kuwait", risk: "LOW" },
  { name: "Elsewedy Electric ME", country: "Egypt", risk: "MEDIUM" },
  { name: "Siemens Egypt Supply", country: "Egypt", risk: "MEDIUM" },
  { name: "Orascom Industrial Supply", country: "Egypt", risk: "HIGH" },
  { name: "Ezz Steel International", country: "Egypt", risk: "HIGH" },
  { name: "El Sewedy Cables ME", country: "Egypt", risk: "MEDIUM" },
  { name: "Dangote Cement Supply", country: "Nigeria", risk: "HIGH" },
  { name: "BUA Group Materials", country: "Nigeria", risk: "HIGH" },
  { name: "Lafarge Africa Supply", country: "Nigeria", risk: "HIGH" },
  { name: "Nigerian Bottling Company", country: "Nigeria", risk: "MEDIUM" },
  { name: "Nestle Nigeria Supply", country: "Nigeria", risk: "MEDIUM" },
  { name: "Unilever Nigeria Supply", country: "Nigeria", risk: "MEDIUM" },
  { name: "PZ Cussons Nigeria", country: "Nigeria", risk: "MEDIUM" },
  { name: "GlaxoSmithKline Nigeria", country: "Nigeria", risk: "MEDIUM" },
  { name: "Seven-Up Bottling Company", country: "Nigeria", risk: "MEDIUM" },
  { name: "Flour Mills Nigeria", country: "Nigeria", risk: "HIGH" },
  { name: "Honeywell Flour Mills", country: "Nigeria", risk: "HIGH" },
  { name: "Olam Nigeria Supply", country: "Nigeria", risk: "MEDIUM" },
  { name: "Tolaram Group Nigeria", country: "Nigeria", risk: "HIGH" },
  { name: "Kraft Heinz MEA Supply", country: "UAE", risk: "LOW" },
  { name: "Coca-Cola Middle East", country: "UAE", risk: "LOW" },
  { name: "PepsiCo Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Mars Gulf Supply Chain", country: "UAE", risk: "LOW" },
  { name: "Mondelez Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Nestle Middle East Supply", country: "UAE", risk: "LOW" },
  { name: "Danone Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "P&G Middle East Supply", country: "UAE", risk: "LOW" },
  { name: "Unilever Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "SC Johnson Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Reckitt Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Henkel Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Colgate-Palmolive Gulf", country: "UAE", risk: "LOW" },
  { name: "Kimberly-Clark Gulf", country: "UAE", risk: "LOW" },
  { name: "Essity Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "L'oreal Middle East", country: "UAE", risk: "LOW" },
  { name: "Estee Lauder Gulf", country: "UAE", risk: "LOW" },
  { name: "Shiseido Middle East", country: "UAE", risk: "LOW" },
  { name: "Coty Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Puig Middle East", country: "UAE", risk: "LOW" },
  { name: "LVMH Middle East Supply", country: "UAE", risk: "LOW" },
  { name: "Richemont Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Kering Middle East", country: "UAE", risk: "LOW" },
  { name: "Chanel Middle East", country: "UAE", risk: "LOW" },
  { name: "Hermes Middle East", country: "UAE", risk: "LOW" },
  { name: "Rolex Middle East", country: "UAE", risk: "LOW" },
  { name: "Swatch Group Gulf", country: "UAE", risk: "LOW" },
  { name: "Tiffany & Co Gulf", country: "UAE", risk: "LOW" },
  { name: "Cartier Middle East", country: "UAE", risk: "LOW" },
  { name: "Bulgari Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Prada Middle East", country: "UAE", risk: "LOW" },
  { name: "Gucci Middle East", country: "UAE", risk: "LOW" },
  { name: "Versace Middle East", country: "UAE", risk: "LOW" },
  { name: "Armani Middle East", country: "UAE", risk: "LOW" },
  { name: "Dolce & Gabbana ME", country: "UAE", risk: "LOW" },
  { name: "Burberry Middle East", country: "UAE", risk: "LOW" },
  { name: "Ferragamo Middle East", country: "UAE", risk: "LOW" },
  { name: "Zegna Middle East", country: "UAE", risk: "LOW" },
  { name: "Hugo Boss Middle East", country: "UAE", risk: "LOW" },
  { name: "Ralph Lauren Gulf", country: "UAE", risk: "LOW" },
  { name: "Tommy Hilfiger Gulf", country: "UAE", risk: "LOW" },
  { name: "Calvin Klein Gulf", country: "UAE", risk: "LOW" },
  { name: "Nike Middle East Supply", country: "UAE", risk: "LOW" },
  { name: "Adidas Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Puma Middle East", country: "UAE", risk: "LOW" },
  { name: "Under Armour Gulf", country: "UAE", risk: "LOW" },
  { name: "Levi Strauss Middle East", country: "UAE", risk: "LOW" },
  { name: "VF Corporation Gulf", country: "UAE", risk: "LOW" },
  { name: "Inditex Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "H&M Middle East Supply", country: "UAE", risk: "LOW" },
  { name: "Mango Middle East", country: "UAE", risk: "LOW" },
  { name: "Benetton Middle East", country: "UAE", risk: "LOW" },
  { name: "Lacoste Middle East", country: "UAE", risk: "LOW" },
  { name: "M&S Middle East Supply", country: "UAE", risk: "LOW" },
  { name: "Debenhams Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Harrods Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Selfridges Middle East", country: "UAE", risk: "LOW" },
  { name: "Galeries Lafayette Gulf", country: "UAE", risk: "LOW" },
  { name: "Printemps Middle East", country: "UAE", risk: "LOW" },
  { name: "IKEA Gulf Supply", country: "UAE", risk: "LOW" },
  { name: "Home Centre Gulf", country: "UAE", risk: "LOW" },
  { name: "Pan Emirates Supply", country: "UAE", risk: "LOW" },
  { name: "The Gulf Home Store", country: "UAE", risk: "LOW" },
  { name: "ACE Hardware Gulf", country: "UAE", risk: "LOW" },
  { name: "Amazon Middle East Supply", country: "UAE", risk: "LOW" },
  { name: "Noon.com Supply Chain", country: "UAE", risk: "LOW" },
];

const CUSTOMER_COMPANIES = [
  { name: "Gulf Automotive Group", country: "UAE" },
  { name: "Saudi Builders Consortium", country: "Saudi Arabia" },
  { name: "Qatar Infrastructure Projects", country: "Qatar" },
  { name: "Kuwait Oil & Gas Corp", country: "Kuwait" },
  { name: "Oman Engineering Works", country: "Oman" },
  { name: "Bahrain Shipbuilding & Repair", country: "Bahrain" },
  { name: "Egyptian Industrial Group", country: "Egypt" },
  { name: "Jordan Steel Mills", country: "Jordan" },
  { name: "Lebanese Construction Co", country: "Lebanon" },
  { name: "Iraq Reconstruction Authority", country: "Iraq" },
  { name: "German Auto Manufacturers", country: "Germany" },
  { name: "British Aerospace Systems", country: "UK" },
  { name: "French Industrial Consortium", country: "France" },
  { name: "Italian Manufacturing Group", country: "Italy" },
  { name: "Spanish Engineering Corp", country: "Spain" },
  { name: "Dutch Maritime Industries", country: "Netherlands" },
  { name: "Swiss Precision Manufacturing", country: "Switzerland" },
  { name: "Swedish Mining Equipment Co", country: "Sweden" },
  { name: "Norwegian Offshore Supply", country: "Norway" },
  { name: "Danish Wind Energy Systems", country: "Denmark" },
  { name: "Finnish Industrial Machinery", country: "Finland" },
  { name: "Polish Steel Fabrication", country: "Poland" },
  { name: "Turkish Heavy Industries", country: "Turkey" },
  { name: "Indian Railways Equipment Co", country: "India" },
  { name: "Chinese Infrastructure Group", country: "China" },
  { name: "Japanese Automotive Parts", country: "Japan" },
  { name: "South Korean Shipbuilding", country: "South Korea" },
  { name: "Singapore Marine Engineering", country: "Singapore" },
  { name: "Malaysian Oil & Gas Supply", country: "Malaysia" },
  { name: "Indonesian Mining Corp", country: "Indonesia" },
  { name: "Thai Industrial Group", country: "Thailand" },
  { name: "Vietnamese Manufacturing Co", country: "Vietnam" },
  { name: "Philippine Construction Supply", country: "Philippines" },
  { name: "Australian Mining Operations", country: "Australia" },
  { name: "Brazilian Industrial Corp", country: "Brazil" },
  { name: "Mexican Automotive Supply", country: "Mexico" },
  { name: "US Defense Contractors", country: "USA" },
  { name: "Canadian Energy Equipment", country: "Canada" },
  { name: "Nigerian State Oil Corp", country: "Nigeria" },
  { name: "Angolan Mining Authority", country: "Angola" },
  { name: "South African Industrial Group", country: "South Africa" },
  { name: "Kenyan Infrastructure Authority", country: "Kenya" },
  { name: "Ethiopian Industrial Parks", country: "Ethiopia" },
  { name: "Ghanaian Manufacturing Corp", country: "Ghana" },
  { name: "Moroccan Industrial Group", country: "Morocco" },
  { name: "Algerian Energy Corp", country: "Algeria" },
  { name: "Tunisian Manufacturing Supply", country: "Tunisia" },
  { name: "Pakistani Heavy Industries", country: "Pakistan" },
  { name: "Bangladeshi Manufacturing Co", country: "Bangladesh" },
  { name: "Sri Lankan Industrial Supply", country: "Sri Lanka" },
  { name: "Kazakh Mining Corp", country: "Kazakhstan" },
  { name: "Russian Industrial Group", country: "Russia" },
  { name: "Ukrainian Steel Manufacturing", country: "Ukraine" },
  { name: "Romanian Industrial Corp", country: "Romania" },
  { name: "Czech Engineering Group", country: "Czech Republic" },
  { name: "Hungarian Manufacturing Co", country: "Hungary" },
  { name: "Slovak Industrial Supply", country: "Slovakia" },
  { name: "Croatian Shipbuilding Co", country: "Croatia" },
  { name: "Serbian Steel Works", country: "Serbia" },
  { name: "Bulgarian Industrial Group", country: "Bulgaria" },
  { name: "Greek Maritime Supply", country: "Greece" },
  { name: "Iranian Industrial Corp", country: "Iran" },
  { name: "Azerbaijani Oil Equipment", country: "Azerbaijan" },
  { name: "Turkmen Industrial Development", country: "Turkmenistan" },
  { name: "Uzbek Manufacturing Corp", country: "Uzbekistan" },
  { name: "Afghan Infrastructure Group", country: "Afghanistan" },
  { name: "Mongolian Mining Supply", country: "Mongolia" },
  { name: "Taiwan Semiconductor Equipment", country: "Taiwan" },
  { name: "Hong Kong Trading Corp", country: "Hong Kong" },
  { name: "Macau Infrastructure Co", country: "Macau" },
  { name: "New Zealand Industrial Supply", country: "New Zealand" },
  { name: "Fiji Maritime Industries", country: "Fiji" },
  { name: "Papua New Guinea Mining", country: "Papua New Guinea" },
  { name: "Chilean Copper Mining Supply", country: "Chile" },
  { name: "Peruvian Mining Corp", country: "Peru" },
  { name: "Argentinian Industrial Group", country: "Argentina" },
  { name: "Colombian Energy Corp", country: "Colombia" },
  { name: "Venezuelan Oil Supply", country: "Venezuela" },
  { name: "Ecuadorian Manufacturing Co", country: "Ecuador" },
  { name: "Dominican Construction Supply", country: "Dominican Republic" },
  { name: "Costa Rican Industrial Corp", country: "Costa Rica" },
  { name: "Panamanian Logistics Hub", country: "Panama" },
  { name: "Guatemalan Manufacturing Co", country: "Guatemala" },
  { name: "Honduran Industrial Supply", country: "Honduras" },
  { name: "Salvadoran Construction Co", country: "El Salvador" },
  { name: "Nicaraguan Industrial Corp", country: "Nicaragua" },
  { name: "Jamaican Manufacturing Co", country: "Jamaica" },
  { name: "Trinidad Energy Corp", country: "Trinidad and Tobago" },
  { name: "Barbados Industrial Supply", country: "Barbados" },
  { name: "Bahamas Development Corp", country: "Bahamas" },
  { name: "Cayman Financial Services", country: "Cayman Islands" },
  { name: "Bermuda Insurance Group", country: "Bermuda" },
  { name: "Icelandic Geothermal Supply", country: "Iceland" },
  { name: "Irish Pharmaceutical Corp", country: "Ireland" },
  { name: "Luxembourg Investment Co", country: "Luxembourg" },
  { name: "Monaco Industrial Holdings", country: "Monaco" },
  { name: "Liechtenstein Manufacturing", country: "Liechtenstein" },
  { name: "Andorran Industrial Supply", country: "Andorra" },
  { name: "Maltese Maritime Supply", country: "Malta" },
  { name: "Cypriot Shipping Corp", country: "Cyprus" },
  { name: "Israeli Defense Equipment", country: "Israel" },
  { name: "Palestinian Industrial Co", country: "Palestine" },
  { name: "Jordanian Phosphate Mining", country: "Jordan" },
  { name: "Syrian Industrial Group", country: "Syria" },
  { name: "Yemeni Oil & Gas Corp", country: "Yemen" },
  { name: "Libyan National Oil Supply", country: "Libya" },
  { name: "Sudanese Mining Corp", country: "Sudan" },
  { name: "Eritrean Industrial Supply", country: "Eritrea" },
  { name: "Djibouti Logistics Hub", country: "Djibouti" },
  { name: "Somali Infrastructure Co", country: "Somalia" },
  { name: "Ugandan Manufacturing Corp", country: "Uganda" },
  { name: "Rwandan Industrial Group", country: "Rwanda" },
  { name: "Tanzanian Mining Supply", country: "Tanzania" },
  { name: "Mozambican Industrial Corp", country: "Mozambique" },
  { name: "Zambian Copper Mining Supply", country: "Zambia" },
  { name: "Zimbabwean Industrial Group", country: "Zimbabwe" },
  { name: "Botswana Diamond Mining Supply", country: "Botswana" },
  { name: "Namibian Mining Corp", country: "Namibia" },
  { name: "Malawian Industrial Supply", country: "Malawi" },
  { name: "Madagascan Mining Corp", country: "Madagascar" },
  { name: "Mauritian Financial Hub", country: "Mauritius" },
  { name: "Seychelles Maritime Supply", country: "Seychelles" },
  { name: "Maldives Infrastructure Corp", country: "Maldives" },
  { name: "Nepalese Hydroelectric Supply", country: "Nepal" },
  { name: "Bhutanese Industrial Corp", country: "Bhutan" },
  { name: "Myanmar Gas & Oil Supply", country: "Myanmar" },
  { name: "Laotian Hydro Power Supply", country: "Laos" },
  { name: "Cambodian Manufacturing Co", country: "Cambodia" },
  { name: "Brunei Oil & Gas Corp", country: "Brunei" },
  { name: "Timor-Leste Petroleum Supply", country: "Timor-Leste" },
  { name: "Mongolian Coal Mining Supply", country: "Mongolia" },
  { name: "North Korean Mining Corp", country: "North Korea" },
  { name: "Equatorial Guinea Oil Supply", country: "Equatorial Guinea" },
  { name: "Gabonese Mining Corp", country: "Gabon" },
  { name: "Republic of Congo Oil", country: "Republic of Congo" },
  { name: "DRC Mining Supply", country: "DRC" },
  { name: "Cameroon Industrial Corp", country: "Cameroon" },
  { name: "Central African Mining Co", country: "Central African Republic" },
  { name: "Chadian Oil Supply", country: "Chad" },
  { name: "Nigerien Uranium Mining", country: "Niger" },
  { name: "Burkinabe Industrial Corp", country: "Burkina Faso" },
  { name: "Malien Mining Supply", country: "Mali" },
  { name: "Senegalese Industrial Group", country: "Senegal" },
  { name: "Guinean Bauxite Mining", country: "Guinea" },
  { name: "Sierra Leone Mining Corp", country: "Sierra Leone" },
  { name: "Liberian Industrial Supply", country: "Liberia" },
  { name: "Ivorian Industrial Corp", country: "Cote d'Ivoire" },
  { name: "Togolese Manufacturing Co", country: "Togo" },
  { name: "Beninese Industrial Supply", country: "Benin" },
  { name: "Gambian Infrastructure Corp", country: "Gambia" },
  { name: "Guinea-Bissau Mining Co", country: "Guinea-Bissau" },
  { name: "Cape Verde Maritime Supply", country: "Cape Verde" },
  { name: "Sao Tome Oil Corp", country: "Sao Tome and Principe" },
  { name: "Comoros Maritime Supply", country: "Comoros" },
  { name: "Mauritania Mining Corp", country: "Mauritania" },
  { name: "Western Sahara Phosphates", country: "Western Sahara" },
  { name: "Lesotho Industrial Corp", country: "Lesotho" },
  { name: "Eswatini Manufacturing Co", country: "Eswatini" },
];

export async function generateEnterpriseData(userId: string, companyId: string): Promise<void> {
  // Helper to pick a random item
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Helper to pick multiple items
  const pickN = <T>(arr: T[], n: number): T[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  };

  // Helper to generate a random amount within a range
  const amountInRange = (min: number, max: number, decimals = 2): number => {
    const val = min + Math.random() * (max - min);
    return Math.round(val * 10 ** decimals) / 10 ** decimals;
  };

  // Generate a deterministic-ish date within a range
  const dateBetween = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  const twoYearsAgo = new Date(Date.now() - 730 * 86400000);
  const now = new Date();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  // ── Users ──
  // We reuse the existing sandbox-guest user as the primary.
  // Create additional employees with realistic data.
  // For time efficiency, we create users in batches where possible.
  const allUsers: { id: string; name: string; email: string; office: string; deptId: string; title: string }[] = [];

  // Add the existing guest user
  allUsers.push({
    id: userId,
    name: "Karim Al-Mansoori",
    email: "sandbox-guest@perionyx.dev",
    office: "Dubai HQ",
    deptId: "dept-manufacturing",
    title: "Chief Executive Officer",
  });

  // Create additional users
  const allUserData = [...USERS_DATA.slice(1), ...generateUsers(200)];

  const seedPasswordHash = await bcrypt.hash("atlas-employee-2024", 4);

  for (const ud of allUserData) {
    const email = `${ud.name.toLowerCase().replace(/\s+/g, ".")}@atlasmanufacturing.ae`;
    try {
      const u = await prisma.user.create({
        data: { email, passwordHash: seedPasswordHash, name: ud.name },
      });

      await prisma.companyMembership.create({
        data: { userId: u.id, companyId, role: ud.title.includes("CEO") || ud.title.includes("CFO") || ud.title.includes("Director") || ud.title.includes("VP") || ud.title.includes("Head") || ud.title.includes("Chief") ? "ADMIN" : "MEMBER" },
      });

      allUsers.push({
        id: u.id,
        name: ud.name,
        email,
        office: ud.office,
        deptId: ud.dept,
        title: ud.title,
      });
    } catch {
      // Skip duplicates
    }
  }

  const getUser = (idx: number) => allUsers[idx % allUsers.length];

  // ── Company Update ──
  await prisma.company.update({
    where: { id: companyId },
    data: {
      legalName: "Atlas Manufacturing Group LLC",
      ein: "98-7654321",
      jurisdiction: "Dubai, UAE",
      entityType: "Limited Liability Company",
      incorporationDate: new Date("1998-06-15"),
      address: "Dubai Silicon Oasis, Building A5, Office 401, Dubai, UAE",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date("2023-01-15"),
    },
  });

  // Create a License for the company (idempotent)
  const existingLicense = await prisma.license.findUnique({ where: { companyId } });
  if (!existingLicense) {
    await prisma.license.create({
      data: {
        companyId,
        key: `ATLAS-${companyId.slice(0, 8).toUpperCase()}-ENT-V1`,
        status: "ACTIVE",
        seats: 500,
        features: { enterprise: true, multiCurrency: true, copilot: true, plaid: true, apiAccess: true, auditTrail: true, reconciliation: true, policyEngine: true, riskManagement: true },
        issuedAt: new Date("2023-01-15"),
        expiresAt: new Date("2027-01-15"),
      },
    });
  }

  // ── Wallets ──
  const walletDefs = [
    { name: "AED Operating Account", currency: "AED", balance: 8750000 },
    { name: "USD Operating Account", currency: "USD", balance: 6200000 },
    { name: "EUR Operating Account", currency: "EUR", balance: 4100000 },
    { name: "GBP Operating Account", currency: "GBP", balance: 2200000 },
    { name: "JPY Operating Account", currency: "JPY", balance: 95000000 },
    { name: "NGN Operating Account", currency: "NGN", balance: 650000000 },
    { name: "AED Payroll Wallet", currency: "AED", balance: 2800000 },
    { name: "USD Payroll Wallet", currency: "USD", balance: 1500000 },
    { name: "EUR Reserve Wallet", currency: "EUR", balance: 7200000 },
    { name: "USD Reserve Wallet", currency: "USD", balance: 12000000 },
    { name: "AED Tax Holding", currency: "AED", balance: 4600000 },
    { name: "USD Receivables Wallet", currency: "USD", balance: 3800000 },
  ];

  const wallets: Record<string, { id: string; name: string; currency: string; balance: number }> = {};
  for (const wd of walletDefs) {
    const wallet = await prisma.wallet.create({
      data: { companyId, name: wd.name, currency: wd.currency, balance: wd.balance, kind: "STANDARD" },
    });
    wallets[wd.currency + "-" + wd.name] = { id: wallet.id, name: wallet.name, currency: wallet.currency, balance: wd.balance };
  }

  const allWalletIds = Object.values(wallets).map((w) => w.id);
  const getWallet = (): (typeof wallets)[string] => {
    const keys = Object.keys(wallets);
    return wallets[keys[Math.floor(Math.random() * keys.length)]];
  };

  const clearingWallet = await prisma.wallet.findFirst({ where: { companyId, kind: "SYSTEM_CLEARING" } });

  // ── Treasury Accounts ──
  const treasuryAccounts: { id: string; name: string; currency: string; balance: number }[] = [];
  for (const ba of BANK_ACCOUNTS) {
    const acct = await prisma.treasuryAccount.create({
      data: {
        companyId,
        name: ba.name,
        currency: ba.currency,
        balance: ba.balance,
        description: `${ba.type} - ${ba.currency}`,
        accountNumber: ba.accountNumber,
        isActive: true,
        plaidAccessToken: `sandbox-mock-token-${ba.name.slice(0, 3).toLowerCase()}${Math.random().toString(36).slice(2, 8)}`,
        plaidAccountId: `sandbox-plaid-${Math.random().toString(36).slice(2, 10)}`,
        plaidItemId: `sandbox-item-${Math.random().toString(36).slice(2, 10)}`,
        lastSyncedAt: new Date(),
      },
    });
    treasuryAccounts.push({ id: acct.id, name: acct.name, currency: acct.currency, balance: ba.balance });

    // Add account controls
    const controls = [];
    if (ba.type === "Operating" || ba.type === "Settlement") {
      controls.push({ accountId: acct.id, companyId, type: "SPENDING_LIMIT" as const, scope: "PER_TRANSACTION" as const, value: ba.currency === "AED" ? 200000 : ba.currency === "USD" ? 100000 : 150000, description: "Max per transaction limit" });
      controls.push({ accountId: acct.id, companyId, type: "VELOCITY_LIMIT" as const, scope: "DAILY" as const, value: ba.currency === "AED" ? 500000 : ba.currency === "USD" ? 300000 : 400000, description: "Daily spending cap" });
    }
    if (ba.type === "Payroll") {
      controls.push({ accountId: acct.id, companyId, type: "DEBIT_BLOCK" as const, scope: "PER_TRANSACTION" as const, value: 0, description: "Only payroll debits allowed" });
    }
    if (ba.type === "Investment") {
      controls.push({ accountId: acct.id, companyId, type: "SPENDING_LIMIT" as const, scope: "PER_TRANSACTION" as const, value: 5000000, description: "Investment transfer limit" });
    }
    if (ba.type === "Tax") {
      controls.push({ accountId: acct.id, companyId, type: "DEBIT_BLOCK" as const, scope: "PER_TRANSACTION" as const, value: 0, description: "Tax account - restricted debits" });
    }
    if (controls.length > 0) {
      await prisma.accountControl.createMany({ data: controls });
    }
  }

  // ── FX Rates (idempotent) ──
  const existingRatesCount = await prisma.exchangeRate.count({ where: { companyId } });
  if (existingRatesCount === 0) {
    const fxData: { companyId: string; baseCurrency: string; quoteCurrency: string; rate: number; source: string; validFrom: Date }[] = [];
    for (const base of CURRENCIES) {
      for (const quote of CURRENCIES) {
        if (base === quote) continue;
        const rate = FX_RATES[base]?.[quote];
        if (rate) {
          fxData.push({ companyId, baseCurrency: base, quoteCurrency: quote, rate, source: "open-exchange-rates", validFrom: new Date("2024-01-01") });
        }
      }
    }
    if (fxData.length > 0) {
      await prisma.exchangeRate.createMany({ data: fxData });
    }
  }

  // ── Vendors (in-memory, referenced by transaction metadata) ──
  const vendors: { id: string; name: string; country: string; risk: string }[] = VENDOR_COMPANIES.map((v, i) => ({
    id: `vendor-${i}`,
    name: v.name,
    country: v.country,
    risk: v.risk,
  }));

  // ── Policy Engine ──
  const policies: { id: string; name: string; type: string }[] = [];

  const policyDefs = [
    { name: "High-Value Approval >$500k", type: "APPROVAL", action: "REQUIRE_APPROVAL", minAmount: 500000, maxAmount: null, txnTypes: ["WALLET_DEBIT", "INTERNAL_TRANSFER"], currencies: [], priority: 1, rules: [{ field: "amount", op: "GREATER_THAN" as const, value: "500000" }] },
    { name: "Medium-Value Approval $100k-$500k", type: "APPROVAL", action: "REQUIRE_APPROVAL", minAmount: 100000, maxAmount: 500000, txnTypes: ["WALLET_DEBIT", "WALLET_CREDIT", "INTERNAL_TRANSFER"], currencies: [], priority: 2, rules: [{ field: "amount", op: "BETWEEN" as const, value: JSON.stringify([100000, 500000]) }] },
    { name: "Weekend Transfer Block", type: "TRANSACTION_LIMIT", action: "BLOCK", minAmount: null, maxAmount: null, txnTypes: ["WALLET_DEBIT", "INTERNAL_TRANSFER"], currencies: [], priority: 3, rules: [{ field: "dayOfWeek", op: "IN" as const, value: "Saturday,Sunday" }] },
    { name: "Cross-Border Compliance", type: "COMPLIANCE", action: "REQUIRE_APPROVAL", minAmount: 10000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: ["EUR", "GBP", "JPY", "NGN"], priority: 4, rules: [{ field: "currency", op: "IN" as const, value: "EUR,GBP,JPY,NGN" }, { field: "amount", op: "GREATER_THAN" as const, value: "10000" }] },
    { name: "Vendor Verification Required", type: "COMPLIANCE", action: "REQUIRE_APPROVAL", minAmount: 50000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 5, rules: [{ field: "amount", op: "GREATER_THAN" as const, value: "50000" }, { field: "transactionType", op: "EQUALS" as const, value: "WALLET_DEBIT" }] },
    { name: "Payroll Security Policy", type: "RISK", action: "REQUIRE_APPROVAL", minAmount: null, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 6, rules: [{ field: "category", op: "EQUALS" as const, value: "payroll" }] },
    { name: "NGN Transaction Limit", type: "TRANSACTION_LIMIT", action: "BLOCK", minAmount: 500000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: ["NGN"], priority: 7, rules: [{ field: "currency", op: "EQUALS" as const, value: "NGN" }, { field: "amount", op: "GREATER_THAN" as const, value: "500000" }] },
    { name: "FX Exposure Limit", type: "RISK", action: "FLAG", minAmount: 2000000, maxAmount: null, txnTypes: ["INTERNAL_TRANSFER"], currencies: ["EUR", "GBP", "JPY"], priority: 8, rules: [{ field: "currency", op: "IN" as const, value: "EUR,GBP,JPY" }, { field: "amount", op: "GREATER_THAN" as const, value: "2000000" }] },
    { name: "Duplicate Payment Detection", type: "RISK", action: "BLOCK", minAmount: 1000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 9, rules: [{ field: "amount", op: "GREATER_THAN" as const, value: "1000" }] },
    { name: "Dormant Account Activity", type: "RISK", action: "FLAG", minAmount: null, maxAmount: null, txnTypes: ["WALLET_DEBIT", "WALLET_CREDIT"], currencies: [], priority: 10, rules: [{ field: "walletAge", op: "GREATER_THAN" as const, value: "90" }] },
    { name: "New Vendor Approval", type: "APPROVAL", action: "REQUIRE_APPROVAL", minAmount: 10000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 11, rules: [{ field: "isNewVendor", op: "EQUALS" as const, value: "true" }] },
    { name: "High-Risk Country Restriction", type: "COMPLIANCE", action: "BLOCK", minAmount: null, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 12, rules: [{ field: "country", op: "IN" as const, value: "Iran,North Korea,Syria,Crimea" }] },
    { name: "Treasury Reserve Minimum", type: "TRANSACTION_LIMIT", action: "BLOCK", minAmount: null, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: ["USD"], priority: 13, rules: [{ field: "walletName", op: "CONTAINS" as const, value: "Reserve" }, { field: "balanceAfter", op: "LESS_THAN" as const, value: "5000000" }] },
    { name: "Single Transaction >$2M", type: "APPROVAL", action: "REQUIRE_APPROVAL", minAmount: 2000000, maxAmount: null, txnTypes: ["WALLET_DEBIT", "WALLET_CREDIT", "INTERNAL_TRANSFER"], currencies: [], priority: 14, rules: [{ field: "amount", op: "GREATER_THAN" as const, value: "2000000" }] },
    { name: "Inter-Company Transfer Compliance", type: "COMPLIANCE", action: "REQUIRE_APPROVAL", minAmount: 100000, maxAmount: null, txnTypes: ["INTERNAL_TRANSFER"], currencies: [], priority: 15, rules: [{ field: "transactionType", op: "EQUALS" as const, value: "INTERNAL_TRANSFER" }, { field: "amount", op: "GREATER_THAN" as const, value: "100000" }] },
    { name: "JPY Large Volume Alert", type: "RISK", action: "FLAG", minAmount: 10000000, maxAmount: null, txnTypes: ["WALLET_DEBIT", "WALLET_CREDIT"], currencies: ["JPY"], priority: 16, rules: [{ field: "currency", op: "EQUALS" as const, value: "JPY" }, { field: "amount", op: "GREATER_THAN" as const, value: "10000000" }] },
    { name: "Weekly Velocity Check", type: "RISK", action: "FLAG", minAmount: null, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 17, rules: [{ field: "weeklyVolume", op: "GREATER_THAN" as const, value: "2000000" }] },
    { name: "Board-Level Approval >$10M", type: "APPROVAL", action: "REQUIRE_APPROVAL", minAmount: 10000000, maxAmount: null, txnTypes: ["WALLET_DEBIT", "WALLET_CREDIT", "INTERNAL_TRANSFER"], currencies: [], priority: 18, rules: [{ field: "amount", op: "GREATER_THAN" as const, value: "10000000" }] },
    { name: "Tax Payment Compliance", type: "COMPLIANCE", action: "REQUIRE_APPROVAL", minAmount: 50000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 19, rules: [{ field: "category", op: "EQUALS" as const, value: "tax" }, { field: "amount", op: "GREATER_THAN" as const, value: "50000" }] },
    { name: "Employee Expense Policy", type: "RISK", action: "REQUIRE_APPROVAL", minAmount: 5000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 20, rules: [{ field: "category", op: "EQUALS" as const, value: "expense" }, { field: "amount", op: "GREATER_THAN" as const, value: "5000" }] },
    { name: "Saudi Riyal Cross-Border Rule", type: "COMPLIANCE", action: "FLAG", minAmount: 50000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: ["SAR"], priority: 21, rules: [{ field: "currency", op: "EQUALS" as const, value: "SAR" }, { field: "amount", op: "GREATER_THAN" as const, value: "50000" }] },
    { name: "Late Payment Surcharge Policy", type: "APPROVAL", action: "FLAG", minAmount: null, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 22, rules: [{ field: "category", op: "EQUALS" as const, value: "late_payment" }] },
    { name: "New Currency Trading Approval", type: "RISK", action: "REQUIRE_APPROVAL", minAmount: null, maxAmount: null, txnTypes: ["INTERNAL_TRANSFER"], currencies: [], priority: 23, rules: [{ field: "isNewCurrency", op: "EQUALS" as const, value: "true" }] },
    { name: "Holiday Blackout Period", type: "TRANSACTION_LIMIT", action: "BLOCK", minAmount: 100000, maxAmount: null, txnTypes: ["WALLET_DEBIT", "WALLET_CREDIT", "INTERNAL_TRANSFER"], currencies: [], priority: 24, rules: [{ field: "isHoliday", op: "EQUALS" as const, value: "true" }, { field: "amount", op: "GREATER_THAN" as const, value: "100000" }] },
    { name: "Vendor Dual-Approval Required", type: "APPROVAL", action: "REQUIRE_APPROVAL", minAmount: 250000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 25, rules: [{ field: "amount", op: "GREATER_THAN" as const, value: "250000" }, { field: "isExternalVendor", op: "EQUALS" as const, value: "true" }] },
    { name: "Cash Concentration Limit", type: "TRANSACTION_LIMIT", action: "BLOCK", minAmount: 3000000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: ["USD"], priority: 26, rules: [{ field: "currency", op: "EQUALS" as const, value: "USD" }, { field: "amount", op: "GREATER_THAN" as const, value: "3000000" }] },
    { name: "Regulatory Reporting Threshold", type: "COMPLIANCE", action: "FLAG", minAmount: 1000000, maxAmount: null, txnTypes: ["WALLET_DEBIT", "WALLET_CREDIT"], currencies: [], priority: 27, rules: [{ field: "amount", op: "GREATER_THAN" as const, value: "1000000" }] },
    { name: "Nigeria NGN Liquidity Reserve", type: "RISK", action: "BLOCK", minAmount: 100000000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: ["NGN"], priority: 28, rules: [{ field: "currency", op: "EQUALS" as const, value: "NGN" }, { field: "amount", op: "GREATER_THAN" as const, value: "100000000" }] },
    { name: "USD Payroll Verification", type: "APPROVAL", action: "REQUIRE_APPROVAL", minAmount: null, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: ["USD"], priority: 29, rules: [{ field: "category", op: "EQUALS" as const, value: "payroll" }, { field: "currency", op: "EQUALS" as const, value: "USD" }] },
    { name: "M&A Activity Flag", type: "RISK", action: "FLAG", minAmount: 5000000, maxAmount: null, txnTypes: ["WALLET_DEBIT"], currencies: [], priority: 30, rules: [{ field: "category", op: "CONTAINS" as const, value: "acquisition" }, { field: "amount", op: "GREATER_THAN" as const, value: "5000000" }] },
  ];

  for (const pd of policyDefs) {
    const policy = await prisma.policy.create({
      data: {
        companyId,
        name: pd.name,
        type: pd.type as any,
        enabled: true,
        priority: pd.priority,
        actionType: pd.action,
        minAmount: pd.minAmount,
        maxAmount: pd.maxAmount,
        appliesToTransactionTypes: pd.txnTypes,
        appliesToCurrencies: pd.currencies,
        createdByUserId: userId,
      },
    });
    policies.push({ id: policy.id, name: pd.name, type: pd.type });

    for (const rule of pd.rules) {
      await prisma.policyRule.create({
        data: {
          policyId: policy.id,
          field: rule.field,
          operator: rule.op,
          value: rule.value,
        },
      });
    }

    // Policy test results
    await prisma.policyTestResult.create({
      data: {
        policyId: policy.id,
        companyId,
        input: { testTransaction: { amount: 250000, currency: "USD", type: "WALLET_DEBIT" } },
        matched: Math.random() > 0.5,
        action: pd.action,
        details: { evaluatedRules: pd.rules.length, matchedRules: Math.floor(Math.random() * pd.rules.length) + 1 },
      },
    });
  }

  // ── Approval Rules ──
  const approvalRules: { id: string; name: string }[] = [];
  const approvalRuleDefs = [
    { name: "Standard Approval - Treasury", priority: 1, scope: "GLOBAL" as const, approvers: 1, roles: ["TREASURER", "ADMIN"], minAmount: 0, maxAmount: 100000 },
    { name: "Enhanced Approval - Finance Director", priority: 2, scope: "GLOBAL" as const, approvers: 2, roles: ["ADMIN", "OWNER"], minAmount: 100000, maxAmount: 500000 },
    { name: "Executive Approval - CFO", priority: 3, scope: "GLOBAL" as const, approvers: 2, roles: ["OWNER"], minAmount: 500000, maxAmount: 2000000 },
    { name: "Board Level Approval", priority: 4, scope: "GLOBAL" as const, approvers: 3, roles: ["OWNER"], minAmount: 2000000, maxAmount: null, dualApproval: true },
    { name: "Compliance Review - Cross Border", priority: 5, scope: "GLOBAL" as const, approvers: 2, roles: ["ADMIN"], minAmount: 50000, maxAmount: null, complianceReview: true },
  ];

  for (const ard of approvalRuleDefs) {
    const rule = await prisma.approvalRule.create({
      data: {
        companyId,
        name: ard.name,
        priority: ard.priority,
        scope: ard.scope,
        minAmount: ard.minAmount,
        maxAmount: ard.maxAmount,
        requiredApprovalsCount: ard.approvers,
        dualApprovalRequired: ard.dualApproval ?? false,
        requiresComplianceReview: ard.complianceReview ?? false,
        applicableTransactionTypes: ["WALLET_DEBIT", "WALLET_CREDIT", "INTERNAL_TRANSFER"],
        applicableConnectorTypes: ["WIRE", "ACH", "SEPA"],
        enabled: true,
        createdByUserId: userId,
      },
    });
    approvalRules.push({ id: rule.id, name: ard.name });

    for (let si = 0; si < Math.min(ard.roles.length, 3); si++) {
      await prisma.approvalStep.create({
        data: { ruleId: rule.id, stepNumber: si + 1, roleRequired: ard.roles[si], approvalCount: 1, timeoutHours: 24 },
      });
    }
  }

  // ── Transactions & Ledger ──
  // We need ~5000 transactions. Let's batch them efficiently.
  const txStatuses: string[] = ["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "PENDING_APPROVAL", "PROCESSING", "FAILED", "CANCELLED", "REVERSED"];
  const txTypes: string[] = ["WALLET_DEBIT", "WALLET_DEBIT", "WALLET_DEBIT", "WALLET_CREDIT", "WALLET_CREDIT", "INTERNAL_TRANSFER"];
  const categoryOptions = [
    "vendor_payment", "vendor_payment", "vendor_payment", "vendor_payment", "payroll",
    "supplier_settlement", "intercompany_transfer", "client_invoice", "tax_payment",
    "expense_reimbursement", "dividend_payment", "loan_repayment", "investment_deposit",
    "insurance_premium", "legal_fees", "consulting_fees", "freight_cost",
    "utility_payment", "rent_payment", "software_license", "maintenance_fee",
    "commission_payment", "royalty_payment", "refund", "settlement",
  ];
  const connectorTypes = ["WIRE", "ACH", "SEPA", "INTERNAL"];
  const entityRefs = ["PO-", "INV-", "CONT-", "PROJ-", "SO-"];

  // ── Transactions + Ledger (Batched) ──
  // Generate data first, then bulk-insert transactions, fetch them back, then bulk-insert ledger entries.
  interface BatchTxEntry {
    reference: string;
    companyId: string; type: string; status: string; primaryAmount: number;
    currency: string; metadata: any; createdByUserId: string;
    createdAt: Date; walletId: string;
  }

  const allTxEntries: BatchTxEntry[] = [];

  for (let i = 0; i < 5000; i++) {
    const status = pick(txStatuses);
    const txnType = pick(txTypes);
    const wallet = getWallet();
    const currency = wallet.currency;
    const baseAmount = status === "COMPLETED" || status === "PROCESSING" || status === "PENDING_APPROVAL"
      ? amountInRange(1000, 500000)
      : amountInRange(100, 25000);
    const amount = Math.round(baseAmount * 100) / 100;

    let category = pick(categoryOptions);
    if (txnType === "INTERNAL_TRANSFER") category = "intercompany_transfer";
    if (txnType === "WALLET_CREDIT" && Math.random() > 0.7) category = "client_invoice";

    const vendor = vendors.length > 0 ? vendors[Math.floor(Math.random() * vendors.length)] : null;
    const entityRef = pick(entityRefs) + String(10000 + i).slice(-5);
    const user = getUser(i);

    const reference = `${entityRef} — ${vendor ? vendor.name : category}`;

    allTxEntries.push({
      reference,
      companyId,
      type: txnType,
      status,
      primaryAmount: amount,
      currency,
      metadata: {
        category,
        department: DEPARTMENTS[i % DEPARTMENTS.length].name,
        businessUnit: DEPARTMENTS[i % DEPARTMENTS.length].busUnit,
        vendorName: vendor?.name ?? null,
        vendorId: vendor?.id ?? null,
        vendorCountry: vendor?.country ?? null,
        connectorType: pick(connectorTypes),
        initiatedBy: user.name,
        initiatedByUserId: user.id,
        office: user.office,
        description: `${category.replace(/_/g, " ")} for ${entityRef}`,
      },
      createdByUserId: user.id,
      createdAt: dateBetween(twoYearsAgo, now),
      walletId: wallet.id,
    });
  }

  // Bulk insert transactions
  const CHUNK_SIZE = 200;
  for (let ci = 0; ci < allTxEntries.length; ci += CHUNK_SIZE) {
    const chunk = allTxEntries.slice(ci, ci + CHUNK_SIZE);
    const txData = chunk.map((e) => ({
      companyId: e.companyId, type: e.type, status: e.status,
      primaryAmount: e.primaryAmount, currency: e.currency,
      reference: e.reference, metadata: e.metadata,
      createdByUserId: e.createdByUserId, createdAt: e.createdAt,
    }));
    try {
      await prisma.transaction.createMany({ data: txData as any });
    } catch {
      // Skip duplicates
    }
  }

  // Fetch all transactions back to get IDs
  const allTransactions = await prisma.transaction.findMany({
    where: { companyId },
    select: { id: true, status: true, reference: true, primaryAmount: true, currency: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const transactionIds = allTransactions.map((t) => t.id);
  const pendingTxIds = allTransactions.filter((t) => t.status === "PENDING_APPROVAL").map((t) => t.id);
  const completedTxIds = allTransactions.filter((t) => t.status === "COMPLETED").map((t) => t.id);

  // Build lookup from reference -> entry data
  const txByRef = new Map(allTxEntries.map((e) => [e.reference, e]));

  // Bulk insert ledger entries
  const allLedgerEntries: {
    companyId: string; transactionId: string; walletId: string; side: string;
    amount: number; currency: string; sequence: number; createdAt: Date;
  }[] = [];

  for (const tx of allTransactions) {
    const ref = tx.reference;
    if (!ref) continue;
    const entry = txByRef.get(ref);
    if (entry && clearingWallet) {
      allLedgerEntries.push(
        { companyId, transactionId: tx.id, walletId: clearingWallet.id, side: "DEBIT", amount: Number(tx.primaryAmount), currency: tx.currency, sequence: 0, createdAt: tx.createdAt },
        { companyId, transactionId: tx.id, walletId: entry.walletId, side: "CREDIT", amount: Number(tx.primaryAmount), currency: tx.currency, sequence: 1, createdAt: tx.createdAt },
      );
    }
  }

  for (let ci = 0; ci < allLedgerEntries.length; ci += CHUNK_SIZE) {
    const chunk = allLedgerEntries.slice(ci, ci + CHUNK_SIZE);
    try {
      await prisma.ledgerEntry.createMany({ data: chunk as any });
    } catch {
      // Skip errors
    }
  }

  // ── Approvals ──
  // Generate approval records for pending and some completed transactions
  const approvalLevels = [1, 1, 1, 2, 2, 3];
  const approvalStatuses = ["APPROVED", "APPROVED", "APPROVED", "APPROVED", "REJECTED", "PENDING", "ESCALATED", "EXPIRED"];
  const rejectionReasons = ["Amount exceeds authorized limit", "Missing supporting documentation", "Vendor not on approved list", "Budget not allocated for this department", "Duplicate payment detected"];

  for (const txId of pendingTxIds) {
    // Create approval thread
    const thread = await prisma.approvalThread.create({
      data: { transactionId: txId, companyId },
    });

    // Add participants
    const participants = pickN(allUsers, Math.min(3, allUsers.length));
    for (const p of participants) {
      await prisma.approvalParticipant.create({
        data: { threadId: thread.id, companyId, userId: p.id },
      });
    }

    // Add a comment
    await prisma.approvalComment.create({
      data: {
        threadId: thread.id,
        companyId,
        authorUserId: participants[0].id,
        body: "Please review this payment for approval. Supporting docs attached.",
        mentions: ["@TREASURER"],
      },
    });

    const numLevels = Math.min(Math.floor(Math.random() * 3) + 1, 3);
    for (let level = 1; level <= numLevels; level++) {
      const approver = allUsers[Math.floor(Math.random() * allUsers.length)];
      const appStatus = level === numLevels ? "PENDING" : "APPROVED";
      await prisma.transactionApproval.create({
        data: {
          transactionId: txId,
          companyId,
          status: appStatus,
          approvingUserId: level < numLevels ? approver.id : null,
          approvingUserRole: level === 1 ? "TREASURER" : level === 2 ? "ADMIN" : "OWNER",
          approvedAt: level < numLevels ? dateBetween(thirtyDaysAgo, now) : null,
          rejectionReason: null,
          level,
          sequenceNumber: level,
        },
      });
    }
  }

  // Additional approvals for completed transactions (500 total target)
  const extraApprovals = Math.max(0, 500 - pendingTxIds.length);
  for (let i = 0; i < Math.min(extraApprovals, completedTxIds.length); i++) {
    const txId = completedTxIds[i];
    const approver = allUsers[Math.floor(Math.random() * allUsers.length)];
    const status = pick(approvalStatuses);
    const isRejected = status === "REJECTED";

    await prisma.transactionApproval.create({
      data: {
        transactionId: txId,
        companyId,
        status,
        approvingUserId: isRejected ? approver.id : status === "APPROVED" ? approver.id : null,
        approvingUserRole: pick(["TREASURER", "ADMIN", "FINANCE_MANAGER"]),
        approvedAt: status === "APPROVED" ? dateBetween(thirtyDaysAgo, now) : null,
        rejectionReason: isRejected ? pick(rejectionReasons) : null,
        level: 1,
        sequenceNumber: 1,
      },
    });
  }

  // ── Risk Incidents (150 target) ──
  const incidentTypes = [
    { category: "BALANCE_ANOMALY", title: "Unusual balance decrease on {{wallet}}", severity: "HIGH" },
    { category: "BALANCE_ANOMALY", title: "Unexpected credit on {{wallet}}", severity: "MEDIUM" },
    { category: "FAILED_APPROVAL", title: "Approval timeout on transaction {{tx}}", severity: "MEDIUM" },
    { category: "FAILED_RECONCILIATION", title: "Reconciliation exception detected", severity: "HIGH" },
    { category: "CONNECTOR_FAILURE", title: "Connector timeout for {{account}}", severity: "CRITICAL" },
    { category: "POLICY_VIOLATION", title: "Policy violation on transaction {{tx}}", severity: "HIGH" },
    { category: "SUSPICIOUS_ACTIVITY", title: "Suspicious payment pattern detected", severity: "CRITICAL" },
    { category: "SYSTEM_ERROR", title: "Ledger sync failure", severity: "HIGH" },
    { category: "COMPLIANCE", title: "Compliance flag on cross-border payment", severity: "MEDIUM" },
    { category: "FX_SYNC", title: "FX rate sync warning", severity: "LOW" },
    { category: "BALANCE_ANOMALY", title: "Dormant account activity on {{wallet}}", severity: "MEDIUM" },
    { category: "FAILED_APPROVAL", title: "Duplicate approval request for {{tx}}", severity: "LOW" },
    { category: "POLICY_VIOLATION", title: "High-value transfer outside policy", severity: "CRITICAL" },
    { category: "BALANCE_ANOMALY", title: "Liquidity threshold warning for {{currency}}", severity: "HIGH" },
    { category: "SUSPICIOUS_ACTIVITY", title: "Multiple failed login attempts detected", severity: "MEDIUM" },
  ];

  const riskSeverities = ["LOW", "MEDIUM", "MEDIUM", "HIGH", "HIGH", "CRITICAL"];

  for (let i = 0; i < 150; i++) {
    const it = pick(incidentTypes);
    const wallet = getWallet();
    const txId = transactionIds.length > 0 ? transactionIds[Math.floor(Math.random() * transactionIds.length)] : null;
    const title = it.title
      .replace("{{wallet}}", wallet.name)
      .replace("{{tx}}", txId ? txId.slice(0, 8) : "N/A")
      .replace("{{account}}", pick(BANK_ACCOUNTS).name)
      .replace("{{currency}}", wallet.currency);

    const riskStatuses: string[] = ["OPEN", "OPEN", "OPEN", "ACKNOWLEDGED", "INVESTIGATING", "RESOLVED", "DISMISSED"];
    const status = pick(riskStatuses);
    const owner = allUsers.length > 0 ? allUsers[Math.floor(Math.random() * allUsers.length)] : null;

    const incident = await prisma.riskIncident.create({
      data: {
        companyId,
        title,
        description: `Automated ${it.category.toLowerCase().replace(/_/g, " ")} detected by ${pick(["LedgerSystem", "ReconciliationEngine", "ConnectorFramework", "PolicyEngine", "SecurityMonitor", "ComplianceChecker"])}.`,
        severity: it.severity as any,
        status: status as any,
        category: it.category as any,
        rootCause: status === "RESOLVED" ? pick(["Configuration error", "System timeout", "Data sync issue", "User error", "External service outage", "Fraudulent activity prevented"]) : null,
        resolution: status === "RESOLVED" ? pick(["Manual override applied", "System recovered", "Transaction reversed", "Policy updated", "Vendor blacklisted"]) : null,
        timeline: {
          events: [
            { timestamp: dateBetween(twoYearsAgo, now), event: "Incident created", actor: "System" },
            { timestamp: dateBetween(twoYearsAgo, now), event: `Assigned to ${owner?.name ?? "unassigned"}`, actor: "System" },
            ...(status === "INVESTIGATING" || status === "RESOLVED" ? [{ timestamp: dateBetween(twoYearsAgo, now), event: "Investigation started", actor: owner?.name ?? "System" }] : []),
            ...(status === "RESOLVED" ? [{ timestamp: dateBetween(twoYearsAgo, now), event: "Incident resolved", actor: owner?.name ?? "System" }] : []),
          ],
        },
        alerts: transactionIds.length > 0 ? [transactionIds[Math.floor(Math.random() * transactionIds.length)].slice(0, 12)] : [],
      },
    });

    // Create linked risk alert
    await prisma.riskAlert.create({
      data: {
        companyId,
        category: it.category as any,
        severity: it.severity as any,
        status: status === "RESOLVED" ? "RESOLVED" : pick(["OPEN", "OPEN", "ACKNOWLEDGED", "INVESTIGATING"]),
        title,
        description: `Linked to incident ${incident.id.slice(0, 8)}`,
        source: pick(["LedgerSystem", "ReconciliationEngine", "ConnectorFramework", "PolicyEngine"]),
        resourceType: txId ? "Transaction" : "Wallet",
        resourceId: txId ?? wallet.id,
        metadata: { incidentId: incident.id, severity: it.severity, category: it.category },
        acknowledgedByUserId: status !== "OPEN" && owner ? owner.id : null,
        acknowledgedAt: status !== "OPEN" ? dateBetween(thirtyDaysAgo, now) : null,
        resolvedByUserId: status === "RESOLVED" && owner ? owner.id : null,
        resolvedAt: status === "RESOLVED" ? dateBetween(thirtyDaysAgo, now) : null,
      },
    });
  }

  // ── Internal Transfers ──
  for (let i = 0; i < 100; i++) {
    const fromIdx = Math.floor(Math.random() * treasuryAccounts.length);
    let toIdx = Math.floor(Math.random() * treasuryAccounts.length);
    while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * treasuryAccounts.length);
    const fromAcct = treasuryAccounts[fromIdx];
    const toAcct = treasuryAccounts[toIdx];
    const amount = amountInRange(50000, 2000000);
    const internalStatuses = ["COMPLETED", "COMPLETED", "COMPLETED", "PROCESSING", "PENDING", "FAILED"];
    const status = pick(internalStatuses);

    try {
      await prisma.internalTransfer.create({
        data: {
          companyId,
          fromAccountId: fromAcct.id,
          toAccountId: toAcct.id,
          amount,
          currency: fromAcct.currency,
          status: status as any,
          reference: `INT-${String(20000 + i).slice(-5)}`,
          description: `Cash concentration from ${fromAcct.name} to ${toAcct.name}`,
          failureReason: status === "FAILED" ? pick(["Insufficient balance", "Account control restriction", "Bank timeout"]) : null,
        },
      });
    } catch {
      // Skip constraint failures
    }
  }

  // ── Reconciliation Runs ──
  for (let monthOffset = 0; monthOffset < 18; monthOffset++) {
    const runDate = new Date(Date.now() - monthOffset * 30 * 86400000);
    const isHealthy = Math.random() > 0.3;

    const run = await prisma.reconciliationRun.create({
      data: {
        companyId,
        status: "COMPLETED",
        type: "FULL",
        summary: {
          walletsChecked: walletDefs.length,
          transactionsChecked: Math.floor(Math.random() * 500) + 50,
          issuesFound: isHealthy ? 0 : Math.floor(Math.random() * 5) + 1,
          isHealthy,
        },
        startedAt: new Date(runDate.getTime() - 3600000),
        completedAt: runDate,
      },
    });

    await prisma.reconciliationReport.create({
      data: {
        runId: run.id,
        companyId,
        title: `Monthly Reconciliation - ${runDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
        data: {
          summary: { totalWallets: walletDefs.length, walletsChecked: walletDefs.length, issuesFound: isHealthy ? 0 : 2, isHealthy },
          details: { runType: "FULL", duration: "45 minutes", method: "automated" },
        },
        totalIssues: isHealthy ? 0 : 2,
        resolvedIssues: isHealthy ? 0 : Math.random() > 0.5 ? 1 : 0,
      },
    });

    if (!isHealthy) {
      const walletsArr = Object.values(wallets);
      await prisma.reconciliationException.create({
        data: {
          runId: run.id,
          companyId,
          type: "BALANCE_MISMATCH",
          severity: "ERROR",
          resourceType: "Wallet",
          resourceId: pick(walletsArr).id,
          message: `Balance mismatch detected during reconciliation`,
          details: { expected: 5000000, actual: 4998750, difference: 1250 },
          resolved: Math.random() > 0.5,
          resolvedAt: Math.random() > 0.5 ? new Date(runDate.getTime() + 86400000) : null,
        },
      });
    }
  }

  // ── Calendar Events ──
  const calendarEvents: { companyId: string; title: string; type: string; startDate: Date; endDate: Date | null; allDay: boolean; status: string; referenceType: string | null; referenceId: string | null }[] = [];

  // Monthly settlement dates
  for (let m = 0; m < 12; m++) {
    const settlementDate = new Date(2025, m, 15);
    calendarEvents.push({
      companyId, title: `Monthly Settlement - ${settlementDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      type: "SETTLEMENT", startDate: settlementDate, endDate: null, allDay: true, status: settlementDate < now ? "COMPLETED" : "SCHEDULED",
      referenceType: null, referenceId: null,
    });
  }

  // Weekly reconciliation
  for (let w = 0; w < 52; w++) {
    const recDate = new Date(2025, 0, 6 + w * 7);
    calendarEvents.push({
      companyId, title: `Weekly Reconciliation - Week ${w + 1}`,
      type: "RECONCILIATION", startDate: recDate, endDate: null, allDay: true, status: recDate < now ? "COMPLETED" : "SCHEDULED",
      referenceType: null, referenceId: null,
    });
  }

  // Payroll dates
  for (let m = 0; m < 12; m++) {
    const payDate = new Date(2025, m, 28);
    calendarEvents.push({
      companyId, title: `Monthly Payroll - ${payDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      type: "SETTLEMENT", startDate: payDate, endDate: null, allDay: true, status: payDate < now ? "COMPLETED" : "SCHEDULED",
      referenceType: null, referenceId: null,
    });
  }

  // Quarter end
  const quarterDates = [
    new Date("2025-03-31"), new Date("2025-06-30"), new Date("2025-09-30"), new Date("2025-12-31"),
    new Date("2026-03-31"), new Date("2026-06-30"),
  ];
  for (const qd of quarterDates) {
    calendarEvents.push({
      companyId, title: `Quarter End - ${qd.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      type: "AUDIT", startDate: qd, endDate: new Date(qd.getTime() + 3 * 86400000), allDay: false,
      status: qd < now ? "COMPLETED" : "SCHEDULED", referenceType: null, referenceId: null,
    });
  }

  // Tax deadlines
  const taxDates = [
    new Date("2025-04-15"), new Date("2025-06-15"), new Date("2025-09-15"), new Date("2025-12-15"),
    new Date("2026-04-15"),
  ];
  for (const td of taxDates) {
    calendarEvents.push({
      companyId, title: `Tax Filing Deadline - ${td.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      type: "AUDIT", startDate: td, endDate: null, allDay: true, status: td < now ? "COMPLETED" : "SCHEDULED",
      referenceType: null, referenceId: null,
    });
  }

  // Board meetings
  for (let m = 0; m < 6; m++) {
    const bd = new Date(2025, m * 2 + 1, 20);
    calendarEvents.push({
      companyId, title: `Board of Directors Meeting - ${bd.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      type: "MANUAL", startDate: bd, endDate: null, allDay: true, status: bd < now ? "COMPLETED" : "SCHEDULED",
      referenceType: null, referenceId: null,
    });
  }

  // Treasury reviews
  for (let m = 0; m < 12; m++) {
    const tr = new Date(2025, m, 10);
    calendarEvents.push({
      companyId, title: `Treasury Review - ${tr.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      type: "MANUAL", startDate: tr, endDate: null, allDay: true, status: tr < now ? "COMPLETED" : "SCHEDULED",
      referenceType: null, referenceId: null,
    });
  }

  // Risk reviews
  for (let m = 0; m < 12; m++) {
    const rr = new Date(2025, m, 5);
    calendarEvents.push({
      companyId, title: `Risk Review - ${rr.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      type: "MANUAL", startDate: rr, endDate: null, allDay: true, status: rr < now ? "COMPLETED" : "SCHEDULED",
      referenceType: null, referenceId: null,
    });
  }

  // Policy review events
  for (const p of policies.slice(0, 5)) {
    calendarEvents.push({
      companyId, title: `${p.name} - Policy Review`,
      type: "AUDIT", startDate: new Date(Date.now() + 86400000 * 30), endDate: null, allDay: true,
      status: "SCHEDULED", referenceType: "Policy", referenceId: p.id,
    });
  }

  await prisma.calendarEvent.createMany({ data: calendarEvents as any });

  // ── Audit Logs (20000+ entries) ──
  const auditActions = [
    "transaction.create", "transaction.update", "transaction.complete", "transaction.fail",
    "transaction.cancel", "transaction.reverse", "transaction.approve", "transaction.reject",
    "wallet.create", "wallet.update", "wallet.balance_change",
    "treasury.create", "treasury.update", "treasury.sync",
    "policy.create", "policy.update", "policy.evaluate", "policy.test",
    "approval.create", "approval.approve", "approval.reject", "approval.escalate",
    "reconciliation.create", "reconciliation.complete", "reconciliation.exception",
    "risk.alert_created", "risk.alert_resolved", "risk.incident_created",
    "connector.run", "connector.fail", "connector.success",
    "user.login", "user.logout", "user.update",
    "company.update", "company.verify",
    "settings.update", "integration.connect", "integration.disconnect",
    "notification.send", "notification.read",
    "report.generate", "report.export",
    "api_key.create", "api_key.revoke",
    "webhook.send", "webhook.fail",
  ];

  const auditResources = [
    "Transaction", "Wallet", "TreasuryAccount", "Policy", "ApprovalRule",
    "TransactionApproval", "ReconciliationRun", "RiskAlert", "RiskIncident",
    "ConnectorConfig", "User", "Company", "Notification", "Report", "ApiKey",
  ];

  const AUDIT_TARGET = 20000;
  const auditBatchSize = 500;
  const numAuditBatches = Math.ceil(AUDIT_TARGET / auditBatchSize);

  for (let batchIdx = 0; batchIdx < numAuditBatches; batchIdx++) {
    const batchStart = batchIdx * auditBatchSize;
    const batchEnd = Math.min(batchStart + auditBatchSize, AUDIT_TARGET);
    const auditBatch: {
      companyId: string; actorUserId: string | null; action: string;
      resourceType: string; resourceId: string | null; severity: string;
      metadata: any; createdAt: Date; ipAddress: string | null; userAgent: string | null;
    }[] = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const user = allUsers.length > 0 ? allUsers[Math.floor(Math.random() * allUsers.length)] : null;
      const action = pick(auditActions);
      const resourceType = pick(auditResources);
      const sev = action.includes("fail") || action.includes("alert") || action.includes("exception")
        ? pick(["WARNING", "WARNING", "CRITICAL"])
        : "INFO";

      const ipOptions = ["192.168.1.", "10.0.0.", "172.16.0.", "203.0.113."];
      const ip = pick(ipOptions) + Math.floor(Math.random() * 255);

      auditBatch.push({
        companyId,
        actorUserId: user?.id ?? null,
        action,
        resourceType,
        resourceId: transactionIds.length > 0 && Math.random() > 0.3 ? pick(transactionIds).slice(0, 12) : null,
        severity: sev,
        metadata: { source: "enterprise-seed", timestamp: new Date().toISOString(), environment: "sandbox" },
        createdAt: dateBetween(twoYearsAgo, now),
        ipAddress: ip,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      });
    }

    if (auditBatch.length > 0) {
      try {
        await prisma.auditLog.createMany({ data: auditBatch as any });
      } catch {
        // Skip errors
      }
    }
  }

  // ── Notifications (500+ entries) ──
  const notificationEvents: { eventType: string; title: string; message: string; channel: string; severity: string }[] = [
    { eventType: "APPROVAL_REQUIRED", title: "Approval Required", message: "A transaction requires your approval", channel: "IN_APP", severity: "info" },
    { eventType: "APPROVAL_COMPLETED", title: "Approval Complete", message: "Transaction has been fully approved", channel: "IN_APP", severity: "success" },
    { eventType: "APPROVAL_REJECTED", title: "Approval Rejected", message: "Transaction has been rejected", channel: "IN_APP", severity: "warning" },
    { eventType: "RISK_ALERT_CREATED", title: "Risk Alert", message: "A new risk alert has been generated", channel: "IN_APP", severity: "critical" },
    { eventType: "RISK_ALERT_RESOLVED", title: "Risk Alert Resolved", message: "A risk alert has been resolved", channel: "IN_APP", severity: "info" },
    { eventType: "RECONCILIATION_COMPLETED", title: "Reconciliation Complete", message: "Reconciliation run completed successfully", channel: "IN_APP", severity: "success" },
    { eventType: "RECONCILIATION_FAILED", title: "Reconciliation Failed", message: "Reconciliation run encountered errors", channel: "IN_APP", severity: "error" },
    { eventType: "POLICY_VIOLATION", title: "Policy Violation", message: "A transaction violated a policy rule", channel: "IN_APP", severity: "critical" },
    { eventType: "CONNECTOR_FAILURE", title: "Connector Failure", message: "A connector failed to sync", channel: "IN_APP", severity: "error" },
    { eventType: "TRANSFER_COMPLETED", title: "Transfer Complete", message: "An internal transfer was completed", channel: "IN_APP", severity: "success" },
    { eventType: "TRANSFER_FAILED", title: "Transfer Failed", message: "An internal transfer has failed", channel: "IN_APP", severity: "error" },
    { eventType: "CALENDAR_EVENT_REMINDER", title: "Upcoming Event", message: "A scheduled event is approaching", channel: "IN_APP", severity: "info" },
    { eventType: "PLAID_SYNC_FAILED", title: "Bank Sync Failed", message: "Plaid bank sync encountered an error", channel: "IN_APP", severity: "error" },
    { eventType: "PLAID_ACCOUNT_LINKED", title: "Bank Account Linked", message: "A new bank account has been linked", channel: "IN_APP", severity: "success" },
  ];

  for (let i = 0; i < 500; i++) {
    const ev = pick(notificationEvents);
    const user = allUsers.length > 0 ? (Math.random() > 0.3 ? allUsers[Math.floor(Math.random() * allUsers.length)] : null) : null;
    const isBroadcast = user === null;

    await prisma.notification.create({
      data: {
        companyId,
        userId: isBroadcast ? null : user.id,
        eventType: ev.eventType as any,
        title: `${ev.title} ${isBroadcast ? "(Broadcast)" : ""}`,
        message: `${ev.message} ${isBroadcast ? "to all users" : ""}`,
        metadata: { severity: ev.severity, generatedAt: dateBetween(twoYearsAgo, now).toISOString() },
        channel: "IN_APP",
        read: Math.random() > 0.5,
        sentAt: dateBetween(twoYearsAgo, now),
        createdAt: dateBetween(twoYearsAgo, now),
      },
    });
  }

  // Ensure the notification channel exists
  const existingChannel = await prisma.notificationChannel.findFirst({ where: { companyId } });
  if (!existingChannel) {
    await prisma.notificationChannel.create({
      data: { companyId, type: "IN_APP", name: "In-App Notifications", config: {}, isActive: true },
    });
  }

  // ── Copilot Conversations ──
  const sampleConversations: { title: string; messages: { role: string; content: string }[] }[] = [
    {
      title: "Treasury Overview",
      messages: [
        { role: "user", content: "Show me a treasury overview for today" },
        { role: "assistant", content: "Here's your treasury overview for Atlas Manufacturing Group:\n\n**Cash Position:** AED 8,750,000 | USD 6,200,000 | EUR 4,100,000\n**Pending Approvals:** 8 transactions worth $1.2M\n**Upcoming Settlements:** 3 for $850K this week\n**Risk Alerts:** 2 open (1 HIGH, 1 MEDIUM)" },
      ],
    },
    {
      title: "Blocked Payments",
      messages: [
        { role: "user", content: "Show me any blocked payments today" },
        { role: "assistant", content: "Based on the policy engine evaluation, there are 3 blocked payments today:\n\n1. **TXN-23891** — $150,000 wire to Nigeria — Blocked by NGN Transaction Limit policy\n2. **TXN-23904** — $525,000 vendor payment — Pending approval under High-Value Approval policy\n3. **TXN-23912** — €85,000 cross-border transfer — Flagged for Compliance Review" },
      ],
    },
    {
      title: "Policy Violations Analysis",
      messages: [
        { role: "user", content: "Explain recent policy violations" },
        { role: "assistant", content: "Recent policy violations for Atlas Manufacturing Group:\n\n1. **Weekend Transfer** (2 violations) — Transactions attempted on Saturday/Sunday blocked by policy\n2. **NGN Transaction Limit** (1 violation) — Attempted transfer of ₦750M exceeded limit\n3. **High-Value Approval** (5 violations) — Transfers over $500k without proper approval chain\n\nRecommended actions: Review weekend policy exceptions, verify NGN liquidity position, escalate high-value approvals to Treasury Director." },
      ],
    },
    {
      title: "Liquidity Forecast",
      messages: [
        { role: "user", content: "Forecast our liquidity for next month" },
        { role: "assistant", content: "**Liquidity Forecast — Next 30 Days**\n\n**Expected Inflows:** $4.2M (client payments, receivables)\n**Expected Outflows:** $3.8M (vendor payments, payroll, tax)\n**Net Position:** +$400K\n\n**Currency Breakdown:**\n- USD: +$250K\n- AED: +AED 1.2M\n- EUR: -€180K\n- GBP: -£95K\n\n**Risk Factors:**\n- 3 large invoices due from high-risk customers\n- FX exposure on EUR position\n- Upcoming tax payment of AED 850K" },
      ],
    },
    {
      title: "Failed Reconciliations",
      messages: [
        { role: "user", content: "Find failed reconciliations this month" },
        { role: "assistant", content: "This month's reconciliation results:\n\n**Completed Runs:** 4 weekly reconciliations\n**Failed:** 1 (Weekly Reconciliation - Week 2)\n**Exceptions Found:** 2\n\n**Exception Details:**\n1. **BALANCE_MISMATCH** — AED Operating Account — Difference of AED 1,250\n2. **TRANSACTION_UNBALANCED** — TXN-22581 — Ledger side mismatch\n\n**Status:** Both exceptions are under investigation by the Treasury team." },
      ],
    },
    {
      title: "High-Risk Vendors",
      messages: [
        { role: "user", content: "Show our highest-risk vendors" },
        { role: "assistant", content: "**High-Risk Vendor Analysis**\n\n| Vendor | Country | Risk Rating | Total Spend YTD |\n|--------|---------|-------------|----------------|\n| Dangote Cement Supply | Nigeria | HIGH | $2.1M |\n| Orascom Industrial Supply | Egypt | HIGH | $890K |\n| Flour Mills Nigeria | Nigeria | HIGH | $650K |\n| Tolaram Group Nigeria | Nigeria | HIGH | $420K |\n| African Mining Supplies | Nigeria | HIGH | $780K |\n\n**Total High-Risk Exposure:** $4.84M\n\n**Recommendations:**\n- Review vendor verification for Nigerian entities\n- Consider requiring dual approval for all high-risk payments\n- Implement quarterly vendor risk reassessment" },
      ],
    },
    {
      title: "Treasury Activity Summary",
      messages: [
        { role: "user", content: "Summarize treasury activity for this week" },
        { role: "assistant", content: "**Weekly Treasury Activity Summary**\n\n**Total Transactions:** 47 ($3.2M total volume)\n\n**Breakdown:**\n- Outgoing Payments: 32 ($2.1M)\n- Incoming Payments: 12 ($950K)\n- Internal Transfers: 3 ($150K)\n\n**Top Categories:**\n1. Vendor Payments: $1.4M\n2. Payroll: $680K\n3. Tax Payments: $320K\n\n**Pending Approvals:** 8 transactions ($1.1M)\n**Reconciliation Status:** 3/4 runs completed\n**New Risk Alerts:** 2 (1 MEDIUM, 1 LOW)\n**FX Exposure:** EUR -€180K, GBP -£95K" },
      ],
    },
    {
      title: "Compliance Calendar",
      messages: [
        { role: "user", content: "What's coming up on the compliance calendar?" },
        { role: "assistant", content: "**Upcoming Compliance Events**\n\n1. **Quarterly Audit** — June 30 - July 3\n2. **Tax Filing Deadline** — June 15 (AED 850K estimated)\n3. **Policy Review** — Transfer Limit >$100k Policy — June 20\n4. **Board Meeting** — July 20 (Treasury report due July 15)\n5. **Monthly Settlement** — July 15 ($2.1M estimated)\n\n**Actions Required:**\n- Prepare audit documentation by June 25\n- Complete tax filing before deadline\n- Update policy review findings" },
      ],
    },
  ];

  for (const conv of sampleConversations) {
    try {
      const conversation = await prisma.copilotConversation.create({
        data: {
          companyId,
          userId,
          title: conv.title,
        },
      });
      const msgData = conv.messages.map((m, idx) => ({
        conversationId: conversation.id,
        role: m.role,
        content: m.content,
        citations: [],
        followUps: [],
        createdAt: new Date(Date.now() - (conv.messages.length - idx) * 60000),
      }));
      await prisma.copilotMessage.createMany({ data: msgData });
    } catch {
      // Skip duplicate conversations
    }
  }

  // ── Notification Preferences for key users ──
  const keyUsers = allUsers.slice(0, Math.min(20, allUsers.length));
  const eventTypes = ["APPROVAL_REQUIRED", "APPROVAL_COMPLETED", "APPROVAL_REJECTED", "RISK_ALERT_CREATED", "RISK_ALERT_RESOLVED", "RECONCILIATION_COMPLETED", "RECONCILIATION_FAILED", "POLICY_VIOLATION", "CONNECTOR_FAILURE", "TRANSFER_COMPLETED", "TRANSFER_FAILED"];
  for (const u of keyUsers) {
    for (const et of eventTypes) {
      try {
        await prisma.notificationPreference.create({
          data: { userId: u.id, companyId, eventType: et as any, enabled: true },
        });
      } catch {
        // Skip duplicates
      }
    }
  }
}
