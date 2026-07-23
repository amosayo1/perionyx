import type {
  BankAccount, BankRelationship, Signatory, Mandate, KYCDocument,
  KYCProfile, BeneficialOwner, OwnershipNode, DormantAccount,
  ComplianceIssue, TrendPoint, AnalyticsSeries, EBAMetrics,
  AccountRecommendation, AccountAlert, ExecutiveInsight,
  AccountType, AccountStatus, LifecycleStage, OwnershipType,
  RiskRating, KYCStatus, SigningAuthority, MandateStatus,
  ComplianceSeverity, RelationshipScore,
} from "./types";

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: readonly T[]): T => arr[rand(0, arr.length - 1)];
const pad = (n: number, w = 4) => String(n).padStart(w, "0");
const fmtDate = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const rDate = (sy: number, ey: number) => fmtDate(rand(sy, ey), rand(1, 12), rand(1, 28));

const FIRST_NAMES = [
  "James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth",
  "William","Susan","Richard","Jessica","Joseph","Sarah","Thomas","Karen","Christopher","Lisa",
  "Daniel","Nancy","Matthew","Betty","Anthony","Margaret","Mark","Sandra","Donald","Ashley",
  "Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle","Kenneth","Carol",
  "Kevin","Amanda","Brian","Melissa","George","Deborah","Timothy","Stephanie","Ronald","Rebecca",
  "Jason","Laura","Jeffrey","Sharon","Ryan","Kathleen","Jacob","Amy","Gary","Angela",
  "Nicholas","Heather","Eric","Rachel","Jonathan","Janet","Stephen","Emma","Scott","Olivia",
  "Justin","Hannah","Frank","Grace","Raymond","Evelyn","Patrick","Abigail","Jack","Chloe",
  "Henry","Isabella","Samuel","Samantha","Adam","Mia","Nathan","Ella",
];
const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
  "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
  "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson",
  "Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
  "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts",
  "Phillips","Evans","Turner","Cooper","Parker","Stewart","Morris","Rogers","Reed","Cook",
  "Morgan","Bell","Murphy","Bailey","Cooper","Richardson","Cox","Howard","Ward",
  "Peterson","Gray","James","Watson","Brooks","Kelly","Sanders","Price","Bennett","Wood",
  "Barnes","Ross","Henderson","Coleman","Jenkins","Perry","Powell","Long","Patterson","Hughes",
  "Washington","Butler","Simmons","Foster","Gonzales","Bryant","Alexander","Russell","Griffin","Diaz",
  "Hayes","Myers","Ford","Hamilton","Graham","Sullivan","Wallace","Woods","Cole","West",
  "Jordan","Owens","Reynolds","Fisher","Ellis","Harrison","Gibson","Mcdonald","Cruz","Marshall",
];
const mkName = () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

const BUSINESS_UNITS = [
  "Corporate Treasury","North America Operations","European Operations",
  "UK Operations","MENA Operations","Africa Operations","APAC Operations",
  "LATAM Operations","Oceania Operations","Canada Operations",
  "India Operations","China Operations","Japan Operations",
  "Brazil Operations","Switzerland Operations","Global Tax",
  "Group Treasury","Strategic Investments","Payroll Services",
  "Shared Services","Trade Finance","Cash Management",
];

const ROLES = [
  "CFO","Treasurer","Director of Treasury","VP Finance",
  "Finance Manager","Senior Accountant","Treasury Analyst",
  "Controller","Assistant Treasurer","Head of Operations",
  "Finance Director","Regional Treasurer","Group Treasurer",
  "Cash Manager","Risk Manager",
];

const DOC_TYPES = [
  "Corporate Charter","Certificate of Incumbency","Board Resolution",
  "Tax Form W-9","Business License","Articles of Incorporation",
  "Proof of Address","AML Questionnaire","Source of Funds Declaration",
  "Financial Statements","Audited Accounts","Passport Copy",
  "Utility Bill","Tax Registration","Operating Agreement",
];

const RMS = [
  "Alice Thornton","Bob Chen","Carol Silva","David Kumar",
  "Elena Petrova","Frank Okafor","Grace Watanabe","Henrik Larsson",
  "Isabela Costa","James O'Brien","Kenji Nakamura","Liam O'Connor",
  "Maria Santos","Nadia Petrov","Omar Hassan",
];

const ACCOUNT_TYPES: AccountType[] = ["checking","savings","money_market","escrow","payroll","tax","investment","collateral","concentration","disbursement","multi_currency","overdraft"];
const OWNERSHIP_TYPES: OwnershipType[] = ["wholly_owned","joint_venture","subsidiary","trust","partnership"];
const STATUSES: AccountStatus[] = ["active","dormant","restricted","frozen","closing","closed","pending_approval"];
const LIFECYCLES: LifecycleStage[] = ["requested","opening","pending_documentation","kyc_review","approval","active","dormant","restricted","closing","closed"];
const RISKS: RiskRating[] = ["low","medium","high","critical"];
const KYCS: KYCStatus[] = ["complete","pending","expired","in_review","missing_documents"];
const AUTH_TYPES: SigningAuthority[] = ["sole","joint","any_two","any_three","manager","director","cfo","ceo"];
const MAND_STATES: MandateStatus[] = ["active","expiring","expired","revoked","pending_renewal"];

const BANK_SWIFT: Record<string, string> = {
  "JP Morgan Chase":"CHASUS33","Citibank":"CITIUS33","HSBC":"HSBCGB2L",
  "Bank of America":"BOFAUS3N","Deutsche Bank":"DEUTDEFF","Barclays":"BARCGB22",
  "Standard Chartered":"SCBLGB2L","BNP Paribas":"BNPAFRPP","Santander":"BSCHESMM",
  "First Abu Dhabi Bank":"FABGAEAA","Standard Bank South Africa":"SBZAZAJJ",
  "DBS Bank":"DHBSSGSG","Commonwealth Bank":"CTBAAU2S",
  "Royal Bank of Canada":"ROYCCAT2","State Bank of India":"SBININBB","ICBC":"ICBKCNBJ",
};

const makeIban = (country: string) => {
  const cc: Record<string,string> = { "United States":"US","United Kingdom":"GB","Germany":"DE","Netherlands":"NL","UAE":"AE","South Africa":"ZA","Singapore":"SG","Brazil":"BR","Australia":"AU","Canada":"CA","India":"IN","China":"CN","Japan":"JP","Switzerland":"CH" };
  const c = cc[country]||"XX";
  return `${c}${rand(10,99)}-${rand(1000,9999)}-${rand(1000,9999)}-${rand(1000,9999)}-${rand(10,99)}`;
};

export const MOCK_ENTITIES = [
  "Perionyx Global Ltd","Perionyx US Corp","Perionyx Europe BV","Perionyx UK plc",
  "Perionyx ME FZCO","Perionyx Africa (Pty) Ltd","Perionyx APAC Pte Ltd",
  "Perionyx LATAM SA","Perionyx Oceania Pty Ltd","Perionyx Canada Inc",
  "Perionyx India Pvt Ltd","Perionyx China Ltd","Perionyx Japan KK",
  "Perionyx Brazil SA","Perionyx Switzerland GmbH",
] as const;

export const MOCK_REGIONS = [
  "North America","Europe","Middle East","Africa","Asia-Pacific",
  "Latin America","Oceania","Canada","South Asia","East Asia",
] as const;

export const MOCK_COUNTRIES = [
  "United States","United Kingdom","Germany","Netherlands","UAE",
  "South Africa","Singapore","Brazil","Australia","Canada",
  "India","China","Japan","Switzerland",
] as const;

export const MOCK_BANKS = [
  "JP Morgan Chase","Citibank","HSBC","Bank of America","Deutsche Bank",
  "Barclays","Standard Chartered","BNP Paribas","Santander",
  "First Abu Dhabi Bank","Standard Bank South Africa","DBS Bank",
  "Commonwealth Bank","Royal Bank of Canada","State Bank of India","ICBC",
] as const;

export const MOCK_CURRENCIES = [
  "USD","EUR","GBP","AED","ZAR","SGD","BRL","CAD","INR","CNY","AUD","JPY","CHF","HKD",
] as const;

const ECFG: Record<string, {reg:string;ctry:string;banks:string[];curs:string[]}> = {
  "Perionyx Global Ltd":{reg:"Europe",ctry:"United Kingdom",banks:["HSBC","Barclays","Standard Chartered"],curs:["USD","EUR","GBP","CHF"]},
  "Perionyx US Corp":{reg:"North America",ctry:"United States",banks:["JP Morgan Chase","Citibank","Bank of America"],curs:["USD"]},
  "Perionyx Europe BV":{reg:"Europe",ctry:"Netherlands",banks:["BNP Paribas","Deutsche Bank","Santander"],curs:["EUR","GBP","CHF"]},
  "Perionyx UK plc":{reg:"Europe",ctry:"United Kingdom",banks:["Barclays","HSBC","Standard Chartered"],curs:["GBP","EUR","USD"]},
  "Perionyx ME FZCO":{reg:"Middle East",ctry:"UAE",banks:["First Abu Dhabi Bank","HSBC","Standard Chartered"],curs:["AED","USD","EUR"]},
  "Perionyx Africa (Pty) Ltd":{reg:"Africa",ctry:"South Africa",banks:["Standard Bank South Africa","Standard Chartered","Citibank"],curs:["ZAR","USD","GBP"]},
  "Perionyx APAC Pte Ltd":{reg:"Asia-Pacific",ctry:"Singapore",banks:["DBS Bank","HSBC","Standard Chartered"],curs:["SGD","USD","HKD","CNY"]},
  "Perionyx LATAM SA":{reg:"Latin America",ctry:"Brazil",banks:["Santander","Citibank","BNP Paribas"],curs:["BRL","USD"]},
  "Perionyx Oceania Pty Ltd":{reg:"Oceania",ctry:"Australia",banks:["Commonwealth Bank","HSBC","Citibank"],curs:["AUD","USD"]},
  "Perionyx Canada Inc":{reg:"Canada",ctry:"Canada",banks:["Royal Bank of Canada","Bank of America","HSBC"],curs:["CAD","USD"]},
  "Perionyx India Pvt Ltd":{reg:"South Asia",ctry:"India",banks:["State Bank of India","HSBC","Standard Chartered"],curs:["INR","USD"]},
  "Perionyx China Ltd":{reg:"East Asia",ctry:"China",banks:["ICBC","HSBC","Standard Chartered"],curs:["CNY","USD","HKD"]},
  "Perionyx Japan KK":{reg:"East Asia",ctry:"Japan",banks:["HSBC","Citibank","Standard Chartered"],curs:["JPY","USD"]},
  "Perionyx Brazil SA":{reg:"Latin America",ctry:"Brazil",banks:["Santander","Citibank"],curs:["BRL","USD"]},
  "Perionyx Switzerland GmbH":{reg:"Europe",ctry:"Switzerland",banks:["Deutsche Bank","BNP Paribas"],curs:["CHF","EUR","USD"]},
};

const gAccName = (e: string, t: AccountType, c: string) => {
  const s = e.replace(/Perionyx /,"").replace(/ \(Pty\) Ltd| Ltd| Inc| plc| SA| BV| GmbH| KK| Pte Ltd| FZCO/g,"").trim();
  const tl = t==="checking"?"Operating":t==="savings"?"Reserve":t==="money_market"?"Money Market":t==="payroll"?"Payroll":t==="tax"?"Tax":t==="investment"?"Investment":t==="escrow"?"Escrow":t==="collateral"?"Collateral":t==="concentration"?"Concentration":t==="disbursement"?"Disbursement":t==="multi_currency"?"Multi-Currency":"Overdraft";
  return `${s} ${tl} ${c}`;
};

export const MOCK_ACCOUNTS: BankAccount[] = (() => {
  const a: BankAccount[] = [];
  let n = 1;
  for (const ent of MOCK_ENTITIES) {
    const c = ECFG[ent];
    const cnt = ent === "Perionyx Global Ltd" ? 36 : rand(24, 32);
    for (let i = 0; i < cnt && n <= 420; i++) {
      const id = `ACC-${pad(n)}`;
      const l4 = pad(rand(0,9999));
      const t = pick(ACCOUNT_TYPES);
      const cur = pick(c.curs);
      const bk = pick(c.banks);
      const oy = rand(2010,2025);
      const op = fmtDate(oy,rand(1,12),rand(1,28));
      const closed = oy < 2022 && Math.random() < 0.12;
      const dormant = !closed && Math.random() < 0.08;
      const pending = !closed && !dormant && Math.random() < 0.04;
      let st: AccountStatus; let lc: LifecycleStage;
      if (closed) { st="closed"; lc="closed"; }
      else if (dormant) { st="dormant"; lc="dormant"; }
      else if (pending) { st="pending_approval"; lc="approval"; }
      else if (Math.random()<0.03) { st="restricted"; lc="restricted"; }
      else if (Math.random()<0.02) { st="frozen"; lc="restricted"; }
      else { st="active"; lc="active"; }
      const cd = closed ? fmtDate(rand(oy+1,2026),rand(1,12),rand(1,28)) : "";
      const bal = closed ? 0 : rand(-100000,150000000);
      const la = closed ? cd : rDate(2023,2026);
      const kyc = lc==="closed"?"complete":lc==="active"?pick(KYCS):"pending" as KYCStatus;
      const risk = pick(RISKS);
      const sc = t==="payroll"||t==="tax"?rand(1,2):rand(2,5);
      const sigs = [...new Set(Array.from({length:sc},()=>`SIG-${pad(rand(1,180))}`))];
      const mf = rand(5,250)*10;
      const ir = t==="savings"||t==="money_market"?parseFloat((rand(10,450)/100).toFixed(2)):parseFloat((rand(0,50)/100).toFixed(2));
      const od = t==="overdraft"?rand(50000,5000000):0;
      const drc = rand(0,3);
      const dr = Array.from({length:drc},()=>pick(DOC_TYPES));
      const ca = rand(0,5);
      a.push({
        id, accountNumber:`****${l4}`, maskedNumber:`****${l4}`,
        iban:makeIban(c.ctry), swift:BANK_SWIFT[bk]||"XXXXUS33",
        accountName:gAccName(ent,t,cur), legalEntity:ent,
        businessUnit:pick(BUSINESS_UNITS), region:c.reg, country:c.ctry,
        bank:bk, currency:cur, accountType:t, ownership:pick(OWNERSHIP_TYPES),
        status:st, lifecycle:lc, risk,
        balance:bal, targetBalance:closed?0:Math.abs(Math.round(bal*(0.8+Math.random()*0.4))),
        utilization:closed?0:rand(10,95),
        openedDate:op, lastActivity:la, closedDate:cd,
        relationshipManager:pick(RMS), signatories:sigs, mandates:[],
        kycStatus:kyc, kycRenewalDate:kyc==="complete"?fmtDate(rand(2025,2027),rand(1,12),rand(1,28)):fmtDate(2024,rand(1,12),rand(1,28)),
        documentsRequired:dr, monthlyFees:mf, interestRate:ir,
        overdraftLimit:od, complianceAlerts:ca,
      });
      n++;
    }
  }
  return a;
})();

export const MOCK_RELATIONSHIPS: BankRelationship[] = (() => {
  const fa = (bn: string) => MOCK_ACCOUNTS.filter(a=>a.bank===bn);
  return [
    {id:"REL-001",bankName:"JP Morgan Chase",region:"North America",country:"United States",relationshipScore:"platinum",scoreValue:95,totalAccounts:fa("JP Morgan Chase").length,totalBalance:fa("JP Morgan Chase").reduce((s,a)=>s+a.balance,0),productsUsed:["Wire Transfers","ACH","Lockbox","Sweep Accounts","Zero Balance Accounts","Commercial Cards","FX Services"],primaryContact:"James Mitchell",relationshipManager:"Alice Thornton",riskRating:"low",lastReview:"2026-01-15",nextReview:"2026-07-15",accountTypes:["checking","savings","money_market","escrow","concentration"],currencies:["USD"],relationshipLength:"12 years",annualFees:125000,serviceLevel:"premium"},
    {id:"REL-002",bankName:"Citibank",region:"North America",country:"United States",relationshipScore:"gold",scoreValue:85,totalAccounts:fa("Citibank").length,totalBalance:fa("Citibank").reduce((s,a)=>s+a.balance,0),productsUsed:["Wire Transfers","Trade Finance","FX","Custody","Global Liquidity"],primaryContact:"Sarah Chen",relationshipManager:"Bob Chen",riskRating:"low",lastReview:"2026-02-20",nextReview:"2026-08-20",accountTypes:["checking","savings","investment","multi_currency"],currencies:["USD"],relationshipLength:"8 years",annualFees:98000,serviceLevel:"premium"},
    {id:"REL-003",bankName:"HSBC",region:"Europe",country:"United Kingdom",relationshipScore:"platinum",scoreValue:92,totalAccounts:fa("HSBC").length,totalBalance:fa("HSBC").reduce((s,a)=>s+a.balance,0),productsUsed:["Global Trade","FX","Supply Chain Finance","Escrow","Multi-Currency Accounts"],primaryContact:"David Wong",relationshipManager:"David Kumar",riskRating:"low",lastReview:"2025-11-10",nextReview:"2026-05-10",accountTypes:["checking","savings","escrow","multi_currency","disbursement"],currencies:["USD","EUR","GBP","HKD","CNY"],relationshipLength:"15 years",annualFees:210000,serviceLevel:"premium"},
    {id:"REL-004",bankName:"Bank of America",region:"North America",country:"United States",relationshipScore:"gold",scoreValue:80,totalAccounts:fa("Bank of America").length,totalBalance:fa("Bank of America").reduce((s,a)=>s+a.balance,0),productsUsed:["ACH","Wire Transfers","Merchant Services","Credit Cards","Payroll"],primaryContact:"Michael Torres",relationshipManager:"Frank Okafor",riskRating:"medium",lastReview:"2025-09-05",nextReview:"2026-03-05",accountTypes:["checking","payroll","tax","savings"],currencies:["USD"],relationshipLength:"6 years",annualFees:72000,serviceLevel:"standard"},
    {id:"REL-005",bankName:"Deutsche Bank",region:"Europe",country:"Germany",relationshipScore:"silver",scoreValue:68,totalAccounts:fa("Deutsche Bank").length,totalBalance:fa("Deutsche Bank").reduce((s,a)=>s+a.balance,0),productsUsed:["Trade Finance","FX","Cash Management","Securities Services"],primaryContact:"Klaus Mueller",relationshipManager:"Elena Petrova",riskRating:"medium",lastReview:"2025-07-22",nextReview:"2026-01-22",accountTypes:["checking","investment","escrow","multi_currency"],currencies:["EUR","USD","CHF"],relationshipLength:"5 years",annualFees:55000,serviceLevel:"standard"},
    {id:"REL-006",bankName:"Barclays",region:"Europe",country:"United Kingdom",relationshipScore:"gold",scoreValue:82,totalAccounts:fa("Barclays").length,totalBalance:fa("Barclays").reduce((s,a)=>s+a.balance,0),productsUsed:["Corporate Banking","Trade","FX","Payroll","Lending"],primaryContact:"Emma Thompson",relationshipManager:"Liam O'Connor",riskRating:"low",lastReview:"2026-03-01",nextReview:"2026-09-01",accountTypes:["checking","payroll","tax","savings","overdraft"],currencies:["GBP","EUR","USD"],relationshipLength:"10 years",annualFees:88000,serviceLevel:"premium"},
    {id:"REL-007",bankName:"Standard Chartered",region:"Europe",country:"United Kingdom",relationshipScore:"gold",scoreValue:78,totalAccounts:fa("Standard Chartered").length,totalBalance:fa("Standard Chartered").reduce((s,a)=>s+a.balance,0),productsUsed:["Global Trade","FX","Supply Chain","Escrow","Multi-Currency"],primaryContact:"Raj Patel",relationshipManager:"Nadia Petrov",riskRating:"medium",lastReview:"2025-10-18",nextReview:"2026-04-18",accountTypes:["checking","escrow","multi_currency","disbursement","concentration"],currencies:["USD","GBP","EUR","SGD","ZAR","AED"],relationshipLength:"9 years",annualFees:105000,serviceLevel:"premium"},
    {id:"REL-008",bankName:"BNP Paribas",region:"Europe",country:"France",relationshipScore:"silver",scoreValue:65,totalAccounts:fa("BNP Paribas").length,totalBalance:fa("BNP Paribas").reduce((s,a)=>s+a.balance,0),productsUsed:["Cash Management","Trade Finance","FX","Securities"],primaryContact:"Jean-Claude Dubois",relationshipManager:"Henrik Larsson",riskRating:"medium",lastReview:"2025-05-30",nextReview:"2025-11-30",accountTypes:["checking","savings","investment","multi_currency"],currencies:["EUR","USD","CHF"],relationshipLength:"4 years",annualFees:42000,serviceLevel:"standard"},
    {id:"REL-009",bankName:"Santander",region:"Europe",country:"Spain",relationshipScore:"bronze",scoreValue:52,totalAccounts:fa("Santander").length,totalBalance:fa("Santander").reduce((s,a)=>s+a.balance,0),productsUsed:["Trade Finance","FX","Payroll","Local Accounts"],primaryContact:"Carlos Mendez",relationshipManager:"Isabela Costa",riskRating:"high",lastReview:"2025-04-12",nextReview:"2025-10-12",accountTypes:["checking","payroll","tax"],currencies:["EUR","BRL","USD"],relationshipLength:"3 years",annualFees:28000,serviceLevel:"basic"},
    {id:"REL-010",bankName:"First Abu Dhabi Bank",region:"Middle East",country:"UAE",relationshipScore:"gold",scoreValue:83,totalAccounts:fa("First Abu Dhabi Bank").length,totalBalance:fa("First Abu Dhabi Bank").reduce((s,a)=>s+a.balance,0),productsUsed:["Corporate Banking","Trade Finance","FX","Cash Management","Shariah-Compliant"],primaryContact:"Ahmed Al Mansouri",relationshipManager:"Omar Hassan",riskRating:"low",lastReview:"2026-02-28",nextReview:"2026-08-28",accountTypes:["checking","savings","escrow","multi_currency"],currencies:["AED","USD","EUR"],relationshipLength:"7 years",annualFees:65000,serviceLevel:"premium"},
    {id:"REL-011",bankName:"Standard Bank South Africa",region:"Africa",country:"South Africa",relationshipScore:"silver",scoreValue:62,totalAccounts:fa("Standard Bank South Africa").length,totalBalance:fa("Standard Bank South Africa").reduce((s,a)=>s+a.balance,0),productsUsed:["Corporate Banking","Trade Finance","FX","Cash Management"],primaryContact:"Thabo Molefe",relationshipManager:"Frank Okafor",riskRating:"medium",lastReview:"2025-08-15",nextReview:"2026-02-15",accountTypes:["checking","savings","payroll","tax"],currencies:["ZAR","USD","GBP"],relationshipLength:"6 years",annualFees:35000,serviceLevel:"standard"},
    {id:"REL-012",bankName:"DBS Bank",region:"Asia-Pacific",country:"Singapore",relationshipScore:"gold",scoreValue:86,totalAccounts:fa("DBS Bank").length,totalBalance:fa("DBS Bank").reduce((s,a)=>s+a.balance,0),productsUsed:["Cash Management","Trade Finance","FX","Supply Chain","Treasury"],primaryContact:"Lim Wei Ming",relationshipManager:"Grace Watanabe",riskRating:"low",lastReview:"2026-01-20",nextReview:"2026-07-20",accountTypes:["checking","savings","multi_currency","concentration","disbursement"],currencies:["SGD","USD","HKD","CNY"],relationshipLength:"11 years",annualFees:95000,serviceLevel:"premium"},
    {id:"REL-013",bankName:"Commonwealth Bank",region:"Oceania",country:"Australia",relationshipScore:"silver",scoreValue:60,totalAccounts:fa("Commonwealth Bank").length,totalBalance:fa("Commonwealth Bank").reduce((s,a)=>s+a.balance,0),productsUsed:["Corporate Banking","Trade Finance","FX","Payroll"],primaryContact:"Sarah Mitchell",relationshipManager:"James O'Brien",riskRating:"medium",lastReview:"2025-06-10",nextReview:"2025-12-10",accountTypes:["checking","savings","payroll","tax"],currencies:["AUD","USD"],relationshipLength:"5 years",annualFees:32000,serviceLevel:"standard"},
    {id:"REL-014",bankName:"Royal Bank of Canada",region:"Canada",country:"Canada",relationshipScore:"gold",scoreValue:79,totalAccounts:fa("Royal Bank of Canada").length,totalBalance:fa("Royal Bank of Canada").reduce((s,a)=>s+a.balance,0),productsUsed:["Cash Management","Trade Finance","FX","Payroll","Treasury"],primaryContact:"Pierre Levesque",relationshipManager:"Maria Santos",riskRating:"low",lastReview:"2026-03-15",nextReview:"2026-09-15",accountTypes:["checking","savings","money_market","payroll"],currencies:["CAD","USD"],relationshipLength:"8 years",annualFees:48000,serviceLevel:"premium"},
    {id:"REL-015",bankName:"State Bank of India",region:"South Asia",country:"India",relationshipScore:"silver",scoreValue:58,totalAccounts:fa("State Bank of India").length,totalBalance:fa("State Bank of India").reduce((s,a)=>s+a.balance,0),productsUsed:["Corporate Banking","Trade Finance","FX","Payroll"],primaryContact:"Ananya Sharma",relationshipManager:"David Kumar",riskRating:"medium",lastReview:"2025-09-25",nextReview:"2026-03-25",accountTypes:["checking","savings","payroll","tax"],currencies:["INR","USD"],relationshipLength:"4 years",annualFees:18000,serviceLevel:"basic"},
    {id:"REL-016",bankName:"ICBC",region:"East Asia",country:"China",relationshipScore:"bronze",scoreValue:48,totalAccounts:fa("ICBC").length,totalBalance:fa("ICBC").reduce((s,a)=>s+a.balance,0),productsUsed:["Corporate Banking","Trade Finance","FX","Cash Management"],primaryContact:"Li Wei",relationshipManager:"Kenji Nakamura",riskRating:"high",lastReview:"2025-04-05",nextReview:"2025-10-05",accountTypes:["checking","savings","payroll","tax"],currencies:["CNY","USD","HKD"],relationshipLength:"3 years",annualFees:15000,serviceLevel:"basic"},
  ];
})();

export const MOCK_SIGNATORIES: Signatory[] = (() => {
  const s: Signatory[] = [];
  for (let i = 1; i <= 180; i++) {
    const id = `SIG-${pad(i)}`;
    const person = mkName();
    const role = pick(ROLES);
    const entity = pick([...MOCK_ENTITIES]);
    const cfg = ECFG[entity];
    const auth = pick(AUTH_TYPES);
    const limit = auth==="ceo"?rand(10000000,50000000):auth==="cfo"?rand(5000000,25000000):auth==="director"?rand(1000000,10000000):auth==="manager"?rand(100000,2000000):rand(50000,5000000);
    const ac = [...new Set(Array.from({length:rand(1,8)},()=>`ACC-${pad(rand(1,420))}`))];
    const st: "active"|"inactive"|"expired"|"revoked" = Math.random()<0.12?"expired":Math.random()<0.05?"revoked":Math.random()<0.04?"inactive":"active";
    const ey = st==="expired"?rand(2022,2025):rand(2026,2029);
    const dom = entity.toLowerCase().replace(/[^a-z0-9]/g,"")+".com";
    const em = person.toLowerCase().replace(/ /g,".")+"@"+dom;
    const ph = `+1-${rand(200,999)}-${rand(100,999)}-${pad(rand(0,9999))}`;
    s.push({id,person,role,entity,region:cfg.reg,bank:pick([...MOCK_BANKS]),accounts:ac,signingAuthority:auth,approvalLimit:limit,status:st,expirationDate:fmtDate(ey,rand(1,12),rand(1,28)),reviewDate:rDate(2025,2026),documents:Array.from({length:rand(2,5)},()=>pick(DOC_TYPES)),phone:ph,email:em});
  }
  return s;
})();

export const MOCK_MANDATES: Mandate[] = (() => {
  const m: Mandate[] = [];
  for (let i = 1; i <= 220; i++) {
    const id = `MND-${pad(i)}`;
    const acc = pick(MOCK_ACCOUNTS);
    const sc = rand(1,4);
    const sigs = [...new Set(Array.from({length:sc},()=>`SIG-${pad(rand(1,180))}`))];
    const auth = pick(AUTH_TYPES);
    const limit = auth==="ceo"?rand(10000000,50000000):auth==="cfo"?rand(5000000,25000000):auth==="director"?rand(1000000,10000000):rand(50000,5000000);
    const ey = rand(2018,2025);
    const ex = ey+rand(2,5);
    const st: MandateStatus = ex<2025?"expired":ex===2025?"expiring":Math.random()<0.05?"revoked":Math.random()<0.04?"pending_renewal":"active";
    m.push({id,mandateId:`MAND-${pad(i)}`,accountId:acc.id,accountNumber:acc.maskedNumber,bank:acc.bank,signatories:sigs,authorityType:auth,approvalLimit:limit,effectiveDate:fmtDate(ey,rand(1,12),rand(1,12)),expiryDate:fmtDate(ex,rand(1,12),rand(1,28)),status:st,renewalRequired:st==="expiring"||st==="expired",lastReviewDate:rDate(2024,2026),notes:st==="expired"?"Renewal overdue - action required":st==="active"?"All signatories confirmed":""});
  }
  return m;
})();

export const MOCK_KYC_DOCUMENTS: KYCDocument[] = (() => {
  const d: KYCDocument[] = [];
  for (let i = 1; i <= 350; i++) {
    const id = `KDC-${pad(i)}`;
    const acc = pick(MOCK_ACCOUNTS);
    const dt = pick(DOC_TYPES);
    const sr = Math.random();
    const st: "received"|"pending"|"expired"|"rejected" = sr<0.55?"received":sr<0.75?"pending":sr<0.90?"expired":"rejected";
    const ry = rand(2020,2025);
    const ey = st==="received"?ry+rand(2,4):ry+rand(0,2);
    d.push({id,accountId:acc.id,documentType:dt,documentName:`${dt}_${acc.legalEntity.replace(/\s/g,"_")}_${ry}`,status:st,receivedDate:fmtDate(ry,rand(1,12),rand(1,28)),expiryDate:fmtDate(ey,rand(1,12),rand(1,28)),renewalDate:fmtDate(ey+1,rand(1,12),rand(1,28)),reviewedBy:st==="pending"?"Awaiting Review":mkName(),notes:st==="rejected"?"Document illegible - resubmit required":st==="pending"?"Under review by compliance":"All checks passed",isRequired:Math.random()<0.85});
  }
  return d;
})();

const mkBO = (): BeneficialOwner => ({
  name: mkName(),
  ownershipPercentage: parseFloat((rand(5,100)).toFixed(1)),
  idType: pick(["Passport","National ID","Driver's License","Residence Permit"]),
  idNumber: `${pick(["AB","CD","EF","GH","JK","LM","NP","QR","ST","UV"])}${pad(rand(100000,999999),6)}`,
  nationality: pick([...MOCK_COUNTRIES]),
  status: pick(["verified","verified","verified","pending","expired"] as const),
});

export const MOCK_KYC_PROFILES: KYCProfile[] = (() => {
  const p: KYCProfile[] = [];
  for (let i = 1; i <= 90; i++) {
    const acc = pick(MOCK_ACCOUNTS);
    const bc = rand(1,4);
    const bos = Array.from({length:bc},()=>mkBO());
    const tp = bos.reduce((s,b)=>s+b.ownershipPercentage,0);
    if (tp>100) bos[bos.length-1].ownershipPercentage -= tp-100;
    const aml: "cleared"|"pending"|"flagged" = Math.random()<0.7?"cleared":Math.random()<0.5?"pending":"flagged";
    const risk: RiskRating = aml==="flagged"?"high":aml==="pending"?"medium":pick(["low","low","medium"]);
    const cp = aml==="cleared"?rand(85,100):aml==="pending"?rand(50,80):rand(30,60);
    const st: KYCStatus = cp>=90?"complete":cp>=70?"in_review":"missing_documents";
    p.push({entity:acc.legalEntity,entityId:`ENT-${pad(i)}`,accountId:acc.id,corporateDocuments:Array.from({length:rand(2,5)},()=>pick(DOC_TYPES)),beneficialOwners:bos,taxForms:Array.from({length:rand(1,3)},()=>pick(DOC_TYPES)),boardResolution:`BR-${acc.legalEntity.replace(/\s/g,"_")}-${rand(2020,2025)}`,businessLicense:`BL-${acc.legalEntity.replace(/\s/g,"_")}`,articlesOfIncorporation:`AOI-${acc.legalEntity.replace(/\s/g,"_")}`,addressProof:pick(["Utility Bill","Lease Agreement","Bank Statement"]),amlReview:aml,riskClassification:risk,completionPercentage:cp,status:st,renewalDate:rDate(2025,2027),lastReviewDate:rDate(2024,2026)});
  }
  return p;
})();

const mkAccNode = (accs: BankAccount[], parentId: string): OwnershipNode[] =>
  accs.map(a => ({id:`ACC-OWN-${a.id}`,label:a.accountName,type:"account" as const,parentId,metadata:{accountId:a.id,currency:a.currency,balance:String(a.balance),status:a.status},children:[]}));

export const MOCK_OWNERSHIP: OwnershipNode = {
  id:"ROOT",label:"Perionyx Enterprise Group",type:"enterprise",parentId:"",metadata:{entity:"Perionyx Enterprise Group",jurisdiction:"Global"},children:[
    {id:"REG-NA",label:"North America",type:"region",parentId:"ROOT",metadata:{region:"North America",hq:"New York, USA"},children:[
      {id:"ENT-US",label:"Perionyx US Corp",type:"entity",parentId:"REG-NA",metadata:{entity:"Perionyx US Corp",jurisdiction:"Delaware",taxId:"US-98-7654321"},children:[
        {id:"BU-US-TREASURY",label:"Corporate Treasury",type:"business_unit",parentId:"ENT-US",metadata:{unit:"Corporate Treasury",head:"Michael Torres"},children:[
          {id:"BNK-JPMC",label:"JP Morgan Chase",type:"bank",parentId:"BU-US-TREASURY",metadata:{swift:"CHASUS33",relationship:"12 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="JP Morgan Chase"&&a.legalEntity==="Perionyx US Corp"),"BNK-JPMC")},
          {id:"BNK-CITI-US",label:"Citibank",type:"bank",parentId:"BU-US-TREASURY",metadata:{swift:"CITIUS33",relationship:"8 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Citibank"&&a.legalEntity==="Perionyx US Corp"),"BNK-CITI-US")},
          {id:"BNK-BOA",label:"Bank of America",type:"bank",parentId:"BU-US-TREASURY",metadata:{swift:"BOFAUS3N",relationship:"6 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Bank of America"&&a.legalEntity==="Perionyx US Corp"),"BNK-BOA")},
        ]},
      ]},
      {id:"ENT-CA",label:"Perionyx Canada Inc",type:"entity",parentId:"REG-NA",metadata:{entity:"Perionyx Canada Inc",jurisdiction:"Ontario",taxId:"CA-12345-6789"},children:[
        {id:"BU-CA-TREASURY",label:"Canada Operations",type:"business_unit",parentId:"ENT-CA",metadata:{unit:"Canada Operations",head:"Pierre Levesque"},children:[
          {id:"BNK-RBC",label:"Royal Bank of Canada",type:"bank",parentId:"BU-CA-TREASURY",metadata:{swift:"ROYCCAT2",relationship:"8 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Royal Bank of Canada"&&a.legalEntity==="Perionyx Canada Inc"),"BNK-RBC")},
          {id:"BNK-BOA-CA",label:"Bank of America (Canada)",type:"bank",parentId:"BU-CA-TREASURY",metadata:{swift:"BOFAUS3N",relationship:"6 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Bank of America"&&a.legalEntity==="Perionyx Canada Inc"),"BNK-BOA-CA")},
          {id:"BNK-HSBC-CA",label:"HSBC (Canada)",type:"bank",parentId:"BU-CA-TREASURY",metadata:{swift:"HSBCGB2L",relationship:"15 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="HSBC"&&a.legalEntity==="Perionyx Canada Inc"),"BNK-HSBC-CA")},
        ]},
      ]},
    ]},
    {id:"REG-EU",label:"Europe",type:"region",parentId:"ROOT",metadata:{region:"Europe",hq:"Amsterdam, Netherlands"},children:[
      {id:"ENT-EUROPE",label:"Perionyx Europe BV",type:"entity",parentId:"REG-EU",metadata:{entity:"Perionyx Europe BV",jurisdiction:"Netherlands",taxId:"NL-123456789-B01"},children:[
        {id:"BU-EU-TREASURY",label:"European Operations",type:"business_unit",parentId:"ENT-EUROPE",metadata:{unit:"European Operations",head:"Jean-Claude Dubois"},children:[
          {id:"BNK-BNP-EU",label:"BNP Paribas",type:"bank",parentId:"BU-EU-TREASURY",metadata:{swift:"BNPAFRPP",relationship:"4 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="BNP Paribas"&&a.legalEntity==="Perionyx Europe BV"),"BNK-BNP-EU")},
          {id:"BNK-DB-EU",label:"Deutsche Bank",type:"bank",parentId:"BU-EU-TREASURY",metadata:{swift:"DEUTDEFF",relationship:"5 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Deutsche Bank"&&a.legalEntity==="Perionyx Europe BV"),"BNK-DB-EU")},
          {id:"BNK-SAN-EU",label:"Santander",type:"bank",parentId:"BU-EU-TREASURY",metadata:{swift:"BSCHESMM",relationship:"3 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Santander"&&a.legalEntity==="Perionyx Europe BV"),"BNK-SAN-EU")},
        ]},
      ]},
      {id:"ENT-UK",label:"Perionyx UK plc",type:"entity",parentId:"REG-EU",metadata:{entity:"Perionyx UK plc",jurisdiction:"England & Wales",taxId:"GB-123456789"},children:[
        {id:"BU-UK-TREASURY",label:"UK Operations",type:"business_unit",parentId:"ENT-UK",metadata:{unit:"UK Operations",head:"Emma Thompson"},children:[
          {id:"BNK-BARC-UK",label:"Barclays",type:"bank",parentId:"BU-UK-TREASURY",metadata:{swift:"BARCGB22",relationship:"10 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Barclays"&&a.legalEntity==="Perionyx UK plc"),"BNK-BARC-UK")},
          {id:"BNK-HSBC-UK",label:"HSBC",type:"bank",parentId:"BU-UK-TREASURY",metadata:{swift:"HSBCGB2L",relationship:"15 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="HSBC"&&a.legalEntity==="Perionyx UK plc"),"BNK-HSBC-UK")},
          {id:"BNK-STAN-UK",label:"Standard Chartered",type:"bank",parentId:"BU-UK-TREASURY",metadata:{swift:"SCBLGB2L",relationship:"9 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Standard Chartered"&&a.legalEntity==="Perionyx UK plc"),"BNK-STAN-UK")},
        ]},
      ]},
      {id:"ENT-CH",label:"Perionyx Switzerland GmbH",type:"entity",parentId:"REG-EU",metadata:{entity:"Perionyx Switzerland GmbH",jurisdiction:"Zürich",taxId:"CH-123456"},children:[
        {id:"BU-CH-TREASURY",label:"Switzerland Operations",type:"business_unit",parentId:"ENT-CH",metadata:{unit:"Switzerland Operations",head:"Klaus Mueller"},children:[
          {id:"BNK-DB-CH",label:"Deutsche Bank (CH)",type:"bank",parentId:"BU-CH-TREASURY",metadata:{swift:"DEUTDEFF",relationship:"5 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Deutsche Bank"&&a.legalEntity==="Perionyx Switzerland GmbH"),"BNK-DB-CH")},
          {id:"BNK-BNP-CH",label:"BNP Paribas (CH)",type:"bank",parentId:"BU-CH-TREASURY",metadata:{swift:"BNPAFRPP",relationship:"4 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="BNP Paribas"&&a.legalEntity==="Perionyx Switzerland GmbH"),"BNK-BNP-CH")},
        ]},
      ]},
      {id:"ENT-GLOBAL",label:"Perionyx Global Ltd",type:"entity",parentId:"REG-EU",metadata:{entity:"Perionyx Global Ltd",jurisdiction:"England & Wales",taxId:"GB-987654321"},children:[
        {id:"BU-GLOBAL-TREASURY",label:"Group Treasury",type:"business_unit",parentId:"ENT-GLOBAL",metadata:{unit:"Group Treasury",head:"James Mitchell"},children:[
          {id:"BNK-HSBC-GLOBAL",label:"HSBC Global",type:"bank",parentId:"BU-GLOBAL-TREASURY",metadata:{swift:"HSBCGB2L",relationship:"15 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="HSBC"&&a.legalEntity==="Perionyx Global Ltd"),"BNK-HSBC-GLOBAL")},
          {id:"BNK-STAN-GLOBAL",label:"Standard Chartered Global",type:"bank",parentId:"BU-GLOBAL-TREASURY",metadata:{swift:"SCBLGB2L",relationship:"9 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Standard Chartered"&&a.legalEntity==="Perionyx Global Ltd"),"BNK-STAN-GLOBAL")},
          {id:"BNK-BARC-GLOBAL",label:"Barclays Global",type:"bank",parentId:"BU-GLOBAL-TREASURY",metadata:{swift:"BARCGB22",relationship:"10 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Barclays"&&a.legalEntity==="Perionyx Global Ltd"),"BNK-BARC-GLOBAL")},
        ]},
      ]},
    ]},
    {id:"REG-ME",label:"Middle East",type:"region",parentId:"ROOT",metadata:{region:"Middle East",hq:"Dubai, UAE"},children:[
      {id:"ENT-ME",label:"Perionyx ME FZCO",type:"entity",parentId:"REG-ME",metadata:{entity:"Perionyx ME FZCO",jurisdiction:"Dubai",taxId:"AE-1234567"},children:[
        {id:"BU-ME-TREASURY",label:"MENA Operations",type:"business_unit",parentId:"ENT-ME",metadata:{unit:"MENA Operations",head:"Ahmed Al Mansouri"},children:[
          {id:"BNK-FAB",label:"First Abu Dhabi Bank",type:"bank",parentId:"BU-ME-TREASURY",metadata:{swift:"FABGAEAA",relationship:"7 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="First Abu Dhabi Bank"&&a.legalEntity==="Perionyx ME FZCO"),"BNK-FAB")},
          {id:"BNK-HSBC-ME",label:"HSBC (ME)",type:"bank",parentId:"BU-ME-TREASURY",metadata:{swift:"HSBCGB2L",relationship:"15 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="HSBC"&&a.legalEntity==="Perionyx ME FZCO"),"BNK-HSBC-ME")},
          {id:"BNK-STAN-ME",label:"Standard Chartered (ME)",type:"bank",parentId:"BU-ME-TREASURY",metadata:{swift:"SCBLGB2L",relationship:"9 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Standard Chartered"&&a.legalEntity==="Perionyx ME FZCO"),"BNK-STAN-ME")},
        ]},
      ]},
    ]},
    {id:"REG-AF",label:"Africa",type:"region",parentId:"ROOT",metadata:{region:"Africa",hq:"Johannesburg, South Africa"},children:[
      {id:"ENT-AF",label:"Perionyx Africa (Pty) Ltd",type:"entity",parentId:"REG-AF",metadata:{entity:"Perionyx Africa (Pty) Ltd",jurisdiction:"South Africa",taxId:"ZA-9876543"},children:[
        {id:"BU-AF-TREASURY",label:"Africa Operations",type:"business_unit",parentId:"ENT-AF",metadata:{unit:"Africa Operations",head:"Thabo Molefe"},children:[
          {id:"BNK-STANBANK",label:"Standard Bank South Africa",type:"bank",parentId:"BU-AF-TREASURY",metadata:{swift:"SBZAZAJJ",relationship:"6 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Standard Bank South Africa"&&a.legalEntity==="Perionyx Africa (Pty) Ltd"),"BNK-STANBANK")},
          {id:"BNK-STAN-AF",label:"Standard Chartered (Africa)",type:"bank",parentId:"BU-AF-TREASURY",metadata:{swift:"SCBLGB2L",relationship:"9 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Standard Chartered"&&a.legalEntity==="Perionyx Africa (Pty) Ltd"),"BNK-STAN-AF")},
          {id:"BNK-CITI-AF",label:"Citibank (Africa)",type:"bank",parentId:"BU-AF-TREASURY",metadata:{swift:"CITIUS33",relationship:"8 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Citibank"&&a.legalEntity==="Perionyx Africa (Pty) Ltd"),"BNK-CITI-AF")},
        ]},
      ]},
    ]},
    {id:"REG-APAC",label:"Asia-Pacific",type:"region",parentId:"ROOT",metadata:{region:"Asia-Pacific",hq:"Singapore"},children:[
      {id:"ENT-APAC",label:"Perionyx APAC Pte Ltd",type:"entity",parentId:"REG-APAC",metadata:{entity:"Perionyx APAC Pte Ltd",jurisdiction:"Singapore",taxId:"SG-123456789"},children:[
        {id:"BU-APAC-TREASURY",label:"APAC Operations",type:"business_unit",parentId:"ENT-APAC",metadata:{unit:"APAC Operations",head:"Lim Wei Ming"},children:[
          {id:"BNK-DBS",label:"DBS Bank",type:"bank",parentId:"BU-APAC-TREASURY",metadata:{swift:"DHBSSGSG",relationship:"11 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="DBS Bank"&&a.legalEntity==="Perionyx APAC Pte Ltd"),"BNK-DBS")},
          {id:"BNK-HSBC-APAC",label:"HSBC (APAC)",type:"bank",parentId:"BU-APAC-TREASURY",metadata:{swift:"HSBCGB2L",relationship:"15 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="HSBC"&&a.legalEntity==="Perionyx APAC Pte Ltd"),"BNK-HSBC-APAC")},
          {id:"BNK-STAN-APAC",label:"Standard Chartered (APAC)",type:"bank",parentId:"BU-APAC-TREASURY",metadata:{swift:"SCBLGB2L",relationship:"9 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Standard Chartered"&&a.legalEntity==="Perionyx APAC Pte Ltd"),"BNK-STAN-APAC")},
        ]},
      ]},
    ]},
    {id:"REG-LATAM",label:"Latin America",type:"region",parentId:"ROOT",metadata:{region:"Latin America",hq:"São Paulo, Brazil"},children:[
      {id:"ENT-LATAM",label:"Perionyx LATAM SA",type:"entity",parentId:"REG-LATAM",metadata:{entity:"Perionyx LATAM SA",jurisdiction:"Brazil",taxId:"BR-123456789-01"},children:[
        {id:"BU-LATAM-TREASURY",label:"LATAM Operations",type:"business_unit",parentId:"ENT-LATAM",metadata:{unit:"LATAM Operations",head:"Carlos Mendez"},children:[
          {id:"BNK-SAN-LATAM",label:"Santander",type:"bank",parentId:"BU-LATAM-TREASURY",metadata:{swift:"BSCHESMM",relationship:"3 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Santander"&&a.legalEntity==="Perionyx LATAM SA"),"BNK-SAN-LATAM")},
          {id:"BNK-CITI-LATAM",label:"Citibank (LATAM)",type:"bank",parentId:"BU-LATAM-TREASURY",metadata:{swift:"CITIUS33",relationship:"8 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Citibank"&&a.legalEntity==="Perionyx LATAM SA"),"BNK-CITI-LATAM")},
          {id:"BNK-BNP-LATAM",label:"BNP Paribas (LATAM)",type:"bank",parentId:"BU-LATAM-TREASURY",metadata:{swift:"BNPAFRPP",relationship:"4 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="BNP Paribas"&&a.legalEntity==="Perionyx LATAM SA"),"BNK-BNP-LATAM")},
        ]},
      ]},
      {id:"ENT-BR",label:"Perionyx Brazil SA",type:"entity",parentId:"REG-LATAM",metadata:{entity:"Perionyx Brazil SA",jurisdiction:"Brazil",taxId:"BR-987654321-01"},children:[
        {id:"BU-BR-TREASURY",label:"Brazil Operations",type:"business_unit",parentId:"ENT-BR",metadata:{unit:"Brazil Operations",head:"Isabela Costa"},children:[
          {id:"BNK-SAN-BR",label:"Santander Brazil",type:"bank",parentId:"BU-BR-TREASURY",metadata:{swift:"BSCHESMM",relationship:"3 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Santander"&&a.legalEntity==="Perionyx Brazil SA"),"BNK-SAN-BR")},
          {id:"BNK-CITI-BR",label:"Citibank Brazil",type:"bank",parentId:"BU-BR-TREASURY",metadata:{swift:"CITIUS33",relationship:"8 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Citibank"&&a.legalEntity==="Perionyx Brazil SA"),"BNK-CITI-BR")},
        ]},
      ]},
    ]},
    {id:"REG-OC",label:"Oceania",type:"region",parentId:"ROOT",metadata:{region:"Oceania",hq:"Sydney, Australia"},children:[
      {id:"ENT-OC",label:"Perionyx Oceania Pty Ltd",type:"entity",parentId:"REG-OC",metadata:{entity:"Perionyx Oceania Pty Ltd",jurisdiction:"Australia",taxId:"AU-123456789"},children:[
        {id:"BU-OC-TREASURY",label:"Oceania Operations",type:"business_unit",parentId:"ENT-OC",metadata:{unit:"Oceania Operations",head:"Sarah Mitchell"},children:[
          {id:"BNK-CBA",label:"Commonwealth Bank",type:"bank",parentId:"BU-OC-TREASURY",metadata:{swift:"CTBAAU2S",relationship:"5 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Commonwealth Bank"&&a.legalEntity==="Perionyx Oceania Pty Ltd"),"BNK-CBA")},
          {id:"BNK-HSBC-OC",label:"HSBC (Oceania)",type:"bank",parentId:"BU-OC-TREASURY",metadata:{swift:"HSBCGB2L",relationship:"15 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="HSBC"&&a.legalEntity==="Perionyx Oceania Pty Ltd"),"BNK-HSBC-OC")},
        ]},
      ]},
    ]},
    {id:"REG-SA",label:"South Asia",type:"region",parentId:"ROOT",metadata:{region:"South Asia",hq:"Mumbai, India"},children:[
      {id:"ENT-SA",label:"Perionyx India Pvt Ltd",type:"entity",parentId:"REG-SA",metadata:{entity:"Perionyx India Pvt Ltd",jurisdiction:"India",taxId:"IN-987654321"},children:[
        {id:"BU-SA-TREASURY",label:"India Operations",type:"business_unit",parentId:"ENT-SA",metadata:{unit:"India Operations",head:"Ananya Sharma"},children:[
          {id:"BNK-SBI",label:"State Bank of India",type:"bank",parentId:"BU-SA-TREASURY",metadata:{swift:"SBININBB",relationship:"4 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="State Bank of India"&&a.legalEntity==="Perionyx India Pvt Ltd"),"BNK-SBI")},
          {id:"BNK-HSBC-SA",label:"HSBC (India)",type:"bank",parentId:"BU-SA-TREASURY",metadata:{swift:"HSBCGB2L",relationship:"15 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="HSBC"&&a.legalEntity==="Perionyx India Pvt Ltd"),"BNK-HSBC-SA")},
        ]},
      ]},
    ]},
    {id:"REG-EA",label:"East Asia",type:"region",parentId:"ROOT",metadata:{region:"East Asia",hq:"Shanghai, China"},children:[
      {id:"ENT-EA-CN",label:"Perionyx China Ltd",type:"entity",parentId:"REG-EA",metadata:{entity:"Perionyx China Ltd",jurisdiction:"China",taxId:"CN-123456789"},children:[
        {id:"BU-CN-TREASURY",label:"China Operations",type:"business_unit",parentId:"ENT-EA-CN",metadata:{unit:"China Operations",head:"Li Wei"},children:[
          {id:"BNK-ICBC",label:"ICBC",type:"bank",parentId:"BU-CN-TREASURY",metadata:{swift:"ICBKCNBJ",relationship:"3 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="ICBC"&&a.legalEntity==="Perionyx China Ltd"),"BNK-ICBC")},
          {id:"BNK-HSBC-CN",label:"HSBC (China)",type:"bank",parentId:"BU-CN-TREASURY",metadata:{swift:"HSBCGB2L",relationship:"15 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="HSBC"&&a.legalEntity==="Perionyx China Ltd"),"BNK-HSBC-CN")},
        ]},
      ]},
      {id:"ENT-EA-JP",label:"Perionyx Japan KK",type:"entity",parentId:"REG-EA",metadata:{entity:"Perionyx Japan KK",jurisdiction:"Japan",taxId:"JP-123456789"},children:[
        {id:"BU-JP-TREASURY",label:"Japan Operations",type:"business_unit",parentId:"ENT-EA-JP",metadata:{unit:"Japan Operations",head:"Kenji Nakamura"},children:[
          {id:"BNK-HSBC-JP",label:"HSBC (Japan)",type:"bank",parentId:"BU-JP-TREASURY",metadata:{swift:"HSBCGB2L",relationship:"15 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="HSBC"&&a.legalEntity==="Perionyx Japan KK"),"BNK-HSBC-JP")},
          {id:"BNK-STAN-JP",label:"Standard Chartered (Japan)",type:"bank",parentId:"BU-JP-TREASURY",metadata:{swift:"SCBLGB2L",relationship:"9 years"},children:mkAccNode(MOCK_ACCOUNTS.filter(a=>a.bank==="Standard Chartered"&&a.legalEntity==="Perionyx Japan KK"),"BNK-STAN-JP")},
        ]},
      ]},
    ]},
  ],
};

export const MOCK_DORMANT_ACCOUNTS: DormantAccount[] = (() => {
  const dormant = MOCK_ACCOUNTS.filter(a => a.status === "dormant");
  const defaulters = MOCK_ACCOUNTS.filter(a => a.status === "active" && a.lastActivity < "2025-01-01" && Math.random() < 0.4);
  const pool = [...dormant, ...defaulters].slice(0, 42);
  return pool.map((a, i) => {
    const dd = rand(90, 720);
    const fees = a.monthlyFees;
    const ytd = fees * Math.min(12, Math.floor(dd / 30));
    const actions: ("close"|"reactivate"|"merge"|"transfer_funds"|"monitor")[] = ["close","reactivate","merge","transfer_funds","monitor"];
    return {
      id: `DRN-${pad(i + 1, 3)}`,
      accountId: a.id,
      accountNumber: a.maskedNumber,
      accountName: a.accountName,
      entity: a.legalEntity,
      bank: a.bank,
      currency: a.currency,
      balance: a.balance,
      dormantDays: dd,
      lastActivity: a.lastActivity,
      monthlyFees: fees,
      feesYearToDate: ytd,
      recommendedAction: pick(actions),
    };
  });
})();

export const MOCK_COMPLIANCE_ISSUES: ComplianceIssue[] = (() => {
  const cats = ["Missing Documentation","Expired Mandates","Expired KYC","Unauthorized Signatory","Policy Violation","Dormant Risk","Country Risk","Sanctions Review","Ownership Issue"];
  const sevs: ComplianceSeverity[] = ["info","warning","critical","emergency"];
  const issues: ComplianceIssue[] = [];
  for (let i = 1; i <= 90; i++) {
    const acc = pick(MOCK_ACCOUNTS);
    const cat = pick(cats);
    const sev: ComplianceSeverity = cat==="Sanctions Review"||cat==="Unauthorized Signatory"?pick(["critical","emergency"] as ComplianceSeverity[]):cat==="Expired Mandates"||cat==="Expired KYC"?pick(["warning","critical"] as ComplianceSeverity[]):pick(sevs);
    const resolved = Math.random() < 0.3;
    issues.push({
      id: `CMP-${pad(i)}`,
      category: cat,
      severity: sev,
      title: `${cat}: ${acc.accountName}`,
      description: `${cat} detected for account ${acc.maskedNumber} at ${acc.bank}. ${sev==="emergency"?"Immediate action required.":"Review and address within 30 days."}`,
      entity: acc.legalEntity,
      accountId: acc.id,
      accountNumber: acc.maskedNumber,
      suggestedAction: cat==="Expired Mandates"?"Renew mandate with current signatories":cat==="Expired KYC"?"Complete KYC renewal process":cat==="Missing Documentation"?"Submit required documents":cat==="Unauthorized Signatory"?"Review and revoke unauthorized access":cat==="Policy Violation"?"Update to comply with current policy":cat==="Dormant Risk"?"Close or reactivate account":cat==="Country Risk"?"Enhanced due diligence required":cat==="Sanctions Review"?"Immediate sanctions screening required":cat==="Ownership Issue"?"Update ownership records":"Contact compliance team",
      timestamp: rDate(2024, 2026),
      acknowledged: Math.random() < 0.4,
      resolved,
    });
  }
  return issues;
})();

export const MOCK_EBAM_METRICS: EBAMetrics = (() => {
  const all = MOCK_ACCOUNTS;
  const active = all.filter(a => a.status === "active");
  const dormant = all.filter(a => a.status === "dormant");
  const restricted = all.filter(a => a.status === "restricted" || a.status === "frozen");
  const closing = all.filter(a => a.status === "closing" || a.status === "closed");
  const totalBal = all.reduce((s, a) => s + a.balance, 0);
  const avgBal = all.length > 0 ? totalBal / all.length : 0;
  const avgUtil = active.length > 0 ? active.reduce((s, a) => s + a.utilization, 0) / active.length : 0;
  const expMand = MOCK_MANDATES.filter(m => m.status === "expiring" || m.status === "expired").length;
  const kycPend = all.filter(a => a.kycStatus === "pending" || a.kycStatus === "expired" || a.kycStatus === "missing_documents").length;
  const compAlerts = all.reduce((s, a) => s + a.complianceAlerts, 0);
  const kycComp = all.length > 0 ? Math.round((all.filter(a => a.kycStatus === "complete").length / all.length) * 100) : 0;
  const mandateCov = all.length > 0 ? Math.round((all.filter(a => a.signatories.length > 0).length / all.length) * 100) : 0;
  const relScores = MOCK_RELATIONSHIPS.map(r => r.scoreValue);
  const relHealth = relScores.length > 0 ? Math.round(relScores.reduce((s, v) => s + v, 0) / relScores.length) : 0;
  return {
    totalAccounts: all.length,
    activeAccounts: active.length,
    dormantAccounts: dormant.length,
    restrictedAccounts: restricted.length,
    closingAccounts: closing.length,
    totalEntities: MOCK_ENTITIES.length,
    totalBanks: MOCK_BANKS.length,
    totalCountries: MOCK_COUNTRIES.length,
    totalCurrencies: MOCK_CURRENCIES.length,
    totalSignatories: MOCK_SIGNATORIES.length,
    mandatesExpiring: expMand,
    kycPending: kycPend,
    complianceAlerts: compAlerts,
    averageBalance: Math.round(avgBal),
    averageUtilization: Math.round(avgUtil),
    complianceScore: Math.max(0, 100 - Math.round(compAlerts / Math.max(1, all.length) * 20)),
    relationshipHealth: relHealth,
    kycCompletion: kycComp,
    mandateCoverage: mandateCov,
    policyCompliance: Math.round(85 + Math.random() * 10),
    totalBalance: Math.round(totalBal),
    trend: totalBal > 0 ? "up" : "stable",
    lastUpdated: "2026-07-09T08:30:00Z",
  };
})();

export const MOCK_RECOMMENDATIONS: AccountRecommendation[] = (() => {
  const cats = ["Consolidation","Optimization","Compliance","Cost Reduction","Risk Mitigation","KYC Remediation","Mandate Renewal","Liquidity Management"];
  const recs: AccountRecommendation[] = [];
  const entities = [...MOCK_ENTITIES];
  for (let i = 1; i <= 35; i++) {
    const ent = pick(entities);
    const cat = pick(cats);
    const prio: "critical"|"high"|"medium"|"low" = cat==="Compliance"||cat==="Risk Mitigation"?pick(["critical","high"] as const):cat==="KYC Remediation"||cat==="Mandate Renewal"?pick(["high","medium"] as const):pick(["medium","low"] as const);
    recs.push({
      id: `REC-${pad(i)}`,
      title: `${cat}: ${ent}`,
      description: `${cat==="Consolidation"?"Merge 3+ low-activity accounts to reduce fees":cat==="Optimization"?"Consolidate banking relationships for better pricing":cat==="Compliance"?"Resolve outstanding compliance issues":cat==="Cost Reduction"?"Close dormant accounts to save annual fees":cat==="Risk Mitigation"?"Reduce concentration risk across banks":cat==="KYC Remediation"?"Update expired KYC documentation":cat==="Mandate Renewal"?"Renew expiring signatory mandates":cat==="Liquidity Management"?"Optimize cash position across entities":"Review and address"} for ${ent}`,
      impact: pick(["$50K-$200K annual savings","Reduced risk exposure","Improved compliance score","Streamlined operations","Cost reduction of 15-20%"]),
      priority: prio,
      category: cat,
      entity: ent,
      roi: pick(["150% in 6 months","200% in 12 months","300% in 18 months","Breakeven in 3 months","50% in 3 months"]),
    });
  }
  return recs;
})();

export const MOCK_ALERTS: AccountAlert[] = (() => {
  const alerts: AccountAlert[] = [];
  for (let i = 1; i <= 45; i++) {
    const acc = pick(MOCK_ACCOUNTS);
    const cat = pick(["Missing Documentation","Expired Mandates","Expired KYC","Unauthorized Signatory","Policy Violation","Dormant Risk","Country Risk","Sanctions Review","Ownership Issue","Balance Threshold","Unusual Activity"]);
    const sev: ComplianceSeverity = cat==="Sanctions Review"||cat==="Unauthorized Signatory"?pick(["critical","emergency"] as ComplianceSeverity[]):cat==="Expired Mandates"||cat==="Expired KYC"?pick(["warning","critical"] as ComplianceSeverity[]):cat==="Balance Threshold"||cat==="Unusual Activity"?pick(["info","warning"] as ComplianceSeverity[]):pick(["info","warning","critical"] as ComplianceSeverity[]);
    alerts.push({
      id: `ALT-${pad(i)}`,
      category: cat,
      severity: sev,
      title: `${cat}: ${acc.maskedNumber}`,
      message: `${cat} detected for ${acc.accountName} at ${acc.bank}. ${sev==="emergency"?"Immediate action required.":sev==="critical"?"Requires attention within 24h.":"Review at earliest convenience."}`,
      entity: acc.legalEntity,
      accountNumber: acc.maskedNumber,
      suggestedAction: cat==="Balance Threshold"?"Review cash position and initiate transfer":cat==="Unusual Activity"?"Investigate recent transactions":cat==="Expired Mandates"?"Renew mandate immediately":cat==="Expired KYC"?"Submit KYC renewal documents":cat==="Missing Documentation"?"Upload required documents to portal":cat==="Dormant Risk"?"Close or reactivate account":"Review and address per compliance policy",
      timestamp: rDate(2026, 2026),
      acknowledged: Math.random() < 0.35,
    });
  }
  return alerts;
})();

export const MOCK_INSIGHTS: ExecutiveInsight[] = [
  {label:"Total Cash Position",value:"$847.3M",description:"Aggregate balance across all entities; up 12.4% QoQ",entity:"Perionyx Global Ltd",severity:"positive"},
  {label:"Mandate Coverage",value:"94.2%",description:"Accounts with valid active mandates; target >98%",entity:"Perionyx US Corp",severity:"warning"},
  {label:"KYC Compliance Rate",value:"87.6%",description:"Accounts with up-to-date KYC documentation; 3 entities below 80%",entity:"Perionyx Europe BV",severity:"warning"},
  {label:"Dormant Account Ratio",value:"8.3%",description:"42 accounts dormant >90 days; $2.1M in annual fees at risk",entity:"Perionyx Global Ltd",severity:"critical"},
  {label:"Bank Relationship Health",value:"74.5%",description:"Weighted average relationship score; 2 banks at bronze level",entity:"Perionyx UK plc",severity:"warning"},
  {label:"Compliance Score",value:"91.2%",description:"Overall compliance health; 12 open critical issues",entity:"Perionyx Global Ltd",severity:"positive"},
  {label:"Cash Concentration",value:"62.3%",description:"Percentage of cash in top 3 banks; concentration risk elevated",entity:"Perionyx APAC Pte Ltd",severity:"warning"},
  {label:"Liquidity Coverage",value:"185%",description:"Short-term liquidity ratio; well above 100% threshold",entity:"Perionyx Global Ltd",severity:"positive"},
  {label:"Monthly Bank Fees",value:"$428,500",description:"Total monthly fees across all relationships; up 3.2% YoY",entity:"Perionyx Europe BV",severity:"warning"},
  {label:"Signatory Coverage",value:"96.8%",description:"Accounts with minimum 2 active signatories; 13 accounts under-covered",entity:"Perionyx ME FZCO",severity:"positive"},
];

export const MOCK_TREND_DATA: Record<string, TrendPoint[]> = {
  accountGrowth: [
    {date:"2025-01",value:385,label:"Jan 2025"},
    {date:"2025-03",value:392,label:"Mar 2025"},
    {date:"2025-05",value:398,label:"May 2025"},
    {date:"2025-07",value:405,label:"Jul 2025"},
    {date:"2025-09",value:410,label:"Sep 2025"},
    {date:"2025-11",value:416,label:"Nov 2025"},
    {date:"2026-01",value:420,label:"Jan 2026"},
  ],
  dormancyTrend: [
    {date:"2025-01",value:28,label:"Jan 2025"},
    {date:"2025-03",value:31,label:"Mar 2025"},
    {date:"2025-05",value:29,label:"May 2025"},
    {date:"2025-07",value:34,label:"Jul 2025"},
    {date:"2025-09",value:36,label:"Sep 2025"},
    {date:"2025-11",value:38,label:"Nov 2025"},
    {date:"2026-01",value:42,label:"Jan 2026"},
  ],
  kycCompletion: [
    {date:"2025-01",value:82,label:"Jan 2025"},
    {date:"2025-03",value:83,label:"Mar 2025"},
    {date:"2025-05",value:84,label:"May 2025"},
    {date:"2025-07",value:85,label:"Jul 2025"},
    {date:"2025-09",value:86,label:"Sep 2025"},
    {date:"2025-11",value:87,label:"Nov 2025"},
    {date:"2026-01",value:88,label:"Jan 2026"},
  ],
  mandateCoverage: [
    {date:"2025-01",value:91,label:"Jan 2025"},
    {date:"2025-03",value:92,label:"Mar 2025"},
    {date:"2025-05",value:91,label:"May 2025"},
    {date:"2025-07",value:93,label:"Jul 2025"},
    {date:"2025-09",value:93,label:"Sep 2025"},
    {date:"2025-11",value:94,label:"Nov 2025"},
    {date:"2026-01",value:94,label:"Jan 2026"},
  ],
  complianceScore: [
    {date:"2025-01",value:88,label:"Jan 2025"},
    {date:"2025-03",value:87,label:"Mar 2025"},
    {date:"2025-05",value:89,label:"May 2025"},
    {date:"2025-07",value:88,label:"Jul 2025"},
    {date:"2025-09",value:90,label:"Sep 2025"},
    {date:"2025-11",value:91,label:"Nov 2025"},
    {date:"2026-01",value:91,label:"Jan 2026"},
  ],
};

export const MOCK_ANALYTICS_SERIES: AnalyticsSeries[] = [
  {name:"Account Growth",data:MOCK_TREND_DATA.accountGrowth,color:"#C8A96E"},
  {name:"Dormancy Trend",data:MOCK_TREND_DATA.dormancyTrend,color:"#E55353"},
  {name:"KYC Completion",data:MOCK_TREND_DATA.kycCompletion,color:"#57AB5A"},
  {name:"Mandate Coverage",data:MOCK_TREND_DATA.mandateCoverage,color:"#4B8BCC"},
  {name:"Compliance Score",data:MOCK_TREND_DATA.complianceScore,color:"#C8A96E"},
  {name:"Balance Growth (USD M)",data:[
    {date:"2025-01",value:720,label:"Jan 2025"},
    {date:"2025-03",value:745,label:"Mar 2025"},
    {date:"2025-05",value:768,label:"May 2025"},
    {date:"2025-07",value:790,label:"Jul 2025"},
    {date:"2025-09",value:812,label:"Sep 2025"},
    {date:"2025-11",value:830,label:"Nov 2025"},
    {date:"2026-01",value:847,label:"Jan 2026"},
  ],color:"#57AB5A"},
  {name:"Fee Trend (USD K)",data:[
    {date:"2025-01",value:385,label:"Jan 2025"},
    {date:"2025-03",value:392,label:"Mar 2025"},
    {date:"2025-05",value:398,label:"May 2025"},
    {date:"2025-07",value:405,label:"Jul 2025"},
    {date:"2025-09",value:415,label:"Sep 2025"},
    {date:"2025-11",value:420,label:"Nov 2025"},
    {date:"2026-01",value:428,label:"Jan 2026"},
  ],color:"#E55353"},
];
