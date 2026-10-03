import json, pathlib, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
pages=[
(1,'home','Home','Tokenizing the World\'s Real-World Assets','Core','Primary ReserveChain landing page connecting the physical-asset evidence chain with digital infrastructure.','Positioning|Trust pillars|Initial asset programs|Physical-to-digital lifecycle|Digital Asset Passport|Reserve framework|Enterprise capabilities|Early Participation'),
(2,'about','About ReserveChain','Building the Infrastructure for Real-World Assets','Company','Mission, vision, operating principles and the infrastructure thesis behind ReserveChain.','Mission and vision|What ReserveChain is building|Initial industrial-metal programs|Expansion model|Institutional positioning'),
(3,'corporate-development-status','Corporate Development Status','Transparent Development. Institutional Standards.','Company','Development-status dashboard across corporate, legal, technology, asset onboarding and launch readiness.','Corporate status|Platform status|Asset onboarding|Legal and compliance|Documentation|Launch readiness'),
(4,'governance','Governance','Built on Integrity. Governed for Long-Term Value.','Company','Governance framework covering corporate, platform, asset and compliance oversight.','Corporate oversight|Platform governance|Asset governance|Conflicts management|Compliance oversight|Governance roadmap'),
(5,'news','News & Announcements','News & Announcements','Company','Structured project updates, milestone announcements and document-release notices.','Project milestones|Asset-program developments|Technology milestones|Document releases|Archive and filters'),
(6,'contact','Contact ReserveChain.io','Contact ReserveChain.io','Company','Inquiry routing for general, enterprise, industrial-buyer, asset-owner, media, compliance and support requests.','General enquiries|Asset owners|Industrial buyers|Enterprise tokenization|Media and compliance|Support'),
(7,'how-it-works','How ReserveChain Works','From Physical Asset to Digital Ownership Infrastructure','Platform','A clear lifecycle from source identification through verification, custody, digital identity, tokenization, reconciliation and redemption.','Identify / Source|Verify|Value|Custody|Passport|Tokenize|Reconcile|Redeem'),
(8,'platform-infrastructure','Platform Infrastructure for Real-World Assets','Institutional Infrastructure for Physical Assets','Platform','System architecture for the registry, passports, evidence, custody, compliance, tokenization, reserves and portals.','Asset Registry|Digital Asset Passports|Verification and custody|Compliance controls|Tokenization engine|Reserve engine|APIs and reporting'),
(9,'technology','Technology','The Technology Powering Real-World Asset Tokenization','Platform','Technical architecture covering contracts, registry records, APIs, audit logs, access control and scalability.','Blockchain architecture|Smart contracts|Asset registry|API layer|Audit logs|Access control|Technology roadmap'),
(10,'security','Security','Institutional Security for Real-World Asset Infrastructure','Platform','Security model for applications, identities, infrastructure, data and operational response without unsupported certification claims.','Identity and access|Application security|Infrastructure security|Data protection|Monitoring|Incident response|Vendor controls'),
(11,'verification','Independent Verification','Trust Is Built Before an Asset Is Tokenized','Platform','Proposed verification workflow for inspection, laboratory evidence, document review and re-verification.','Independent testing|Document validation|Sampling methodology|Laboratory evidence|Valuation review|Evidence chain|Re-verification'),
(12,'custody','Custody & Vault Structure','Secure. Controlled. Auditable.','Platform','Proposed custody architecture including segregation, inventory, access, chain of custody and release controls.','Custody model|Segregation|Inventory records|Access controls|Insurance status|Inspection and audit|Release controls'),
(13,'proof-of-reserves','Proof of Real-World Asset Reserves','Transparent. Verifiable. Reconciled.','Platform','Reserve methodology and reconciliation interface, clearly separated from any unapproved live reserve claim.','Reserve methodology|Eligible inventory|Token supply inputs|Coverage calculation|Reconciliation|Supporting documents|Exceptions'),
(14,'digital-asset-passports','Digital Asset Passports','A Persistent Digital Identity for Every Asset Unit','Platform','Persistent asset records connecting specifications, evidence, custody, reserve and tokenization states.','Unique Asset ID|Specifications|Certificates|Provenance|Custody|Valuation|Reserve status|Blockchain references|History'),
(15,'tokenization','Tokenization','Connecting Verified Physical Assets to Digital Infrastructure','Platform','Proposed asset onboarding and ERC-20 lifecycle with issuance controls, reconciliation and retirement.','Eligibility|Asset identity|Legal and operational linkage|Issuance controls|Transfer rules|Reconciliation|Burn / retirement'),
(16,'physical-redemption','Physical Redemption','From Digital Position to Physical Asset Delivery','Platform','Proposed redemption workflow from request through compliance, settlement, custody release and completion.','Request|Eligibility|Verification|Settlement / burn|Custody release|Logistics / collection|Completion'),
(17,'redemption-portal','Redemption Portal','Redeem Real Assets. Seamlessly. Securely.','Portal','Functional portal architecture for eligible holdings, request status, custody release and delivery documentation.','Eligible holdings|Request creation|Compliance state|Settlement status|Custody release|Delivery / collection|Documents|History'),
(18,'explore-assets','Explore Real-World Assets','Explore Real-World Assets','Assets','Catalogue interface placing the two initial industrial-metal programs first and keeping future categories clearly pre-launch.','Current programs|Program status filters|Verification status|Passport status|Tokenization status|Future categories'),
(19,'asset-programs','All Asset Programs','All Real-World Asset Programs','Assets','Master directory for current, upcoming and future real-world asset programs.','Current programs|Upcoming programs|Future categories|Status discipline|Program links'),
(20,'initial-programs','Initial Asset Programs','Initial Asset Programs','Assets','Dedicated introduction to Ultrafine Copper Powder and Nickel Wire 0.025 mm.','Copper Powder|Nickel Wire|Key specifications|Verification framework|Custody framework|Passports|Reserve model'),
(21,'industrial-metals','All Industrial Metal Programs','All Industrial Metal Programs','Assets','Industrial-metals hub for the two initial programs and any future approved metal categories.','Copper Powder|Nickel Wire|Industrial use cases|Verification flow|Future metal concepts'),
(22,'copper-powder','Ultrafine Copper Powder','Ultrafine Copper Powder - Asset Program','Asset Program','Full evidence-led program page for the supplied Copper Powder program.','Program overview|Technical specifications|IGAS laboratory evidence|Custody status|Digital Asset Passport|Reserve framework|Applications|Documents|Redemption context'),
(23,'copper-gallery','Copper Powder Product Gallery','Ultrafine Copper Powder - Product Gallery','Asset Program','Evidence-oriented gallery structure for approved Copper Powder photography and document previews.','Approved photography|Packaging|Macro views|Handling imagery|Certificate previews|Evidence metadata'),
(24,'nickel-wire','Ultrafine Nickel Wire 0.025 mm','Ultrafine Nickel Wire 0.025 mm - Asset Program','Asset Program','Full evidence-led program page for the supplied 0.025 mm Nickel Wire program.','Program overview|Diameter and specifications|IGAS laboratory evidence|Custody status|Digital Asset Passport|Reserve framework|Applications|Documents'),
(25,'nickel-gallery','Nickel Wire Product Gallery','Nickel Wire 0.025 mm - Product Gallery','Asset Program','Evidence-oriented gallery structure for accurate wire-scale imagery, packaging and certificate previews.','Approved photography|Spools and reels|Macro views|Measurement imagery|Certificate previews|Evidence metadata'),
(26,'future-assets','Future Asset Categories','Future Real-World Asset Categories','Assets','Pre-launch storytelling for future approved categories without mixing them into current reserve or program claims.','Precious Metals|Gemstones|Energy Assets|Real Estate|Art & Collectibles|Other Assets'),
(27,'early-participation','Early Participation Program','Early Participation Program for Real-World Asset Infrastructure','Participation','Pre-launch program information explaining purpose, eligibility, safeguards, process, risks and waitlist access.','Purpose|Participant profile|Program stage|Eligibility|Initial assets|Safeguards|Risks|Waitlist'),
(28,'program-overview','Program Overview','Early Participation Program Overview','Participation','Detailed proposed structure for the participation program and its supporting documentation.','Program structure|Initial assets|Benefits|Process|Compliance|Methodology|Risk factors|Status'),
(29,'token-acquisition','How Token Acquisition Will Work','How Token Acquisition Will Work','Participation','Planned future acquisition flow, inactive until legal, compliance and deployment authorization is complete.','Create account|Eligibility|KYC/KYB|Review program|Review documents|Settlement|Portfolio|Redemption'),
(30,'discount-methodology','20% Discount Methodology','20% Discount Methodology','Participation','Methodology page reserved for owner-approved valuation references, formulae, examples, limits and disclosures.','Valuation reference|Calculation formula|Worked example|Eligibility|Limits|Exclusions|Governance'),
(31,'eligibility-kyc','Eligibility & KYC','Eligibility & KYC','Participation','Configurable eligibility, KYC/KYB, AML, sanctions and enhanced-due-diligence workflow.','Individual eligibility|Corporate eligibility|KYC / KYB|AML and sanctions|Source of funds|Enhanced review|Approval states'),
(32,'restricted-jurisdictions','Restricted Jurisdictions','Restricted Jurisdictions','Participation','Jurisdiction controls and disclosure area governed by approved legal rules.','Geographic restrictions|Participant responsibility|Sanctions|Blocked access|Updates|Final legal documentation'),
(33,'waitlist','Join the Early Participation Waitlist','Join the Early Participation Waitlist','Participation','Functional registration-of-interest flow with consent recording and no payment or wallet collection.','Why register|Current availability|Who may register|Process|Communications|Compliance notice|FAQ|Waitlist form'),
(34,'industrial-buyers','Industrial Buyers','Secure. Compliant. Reliable.','Market','Buyer-focused workflow for manufacturers, processors and qualified industrial counterparties.','Verified materials|Documentation|Sourcing|Procurement workflow|Physical delivery|Institutional enquiry'),
(35,'asset-owners','Asset Owners & Originators','Bring Real-World Assets Into Digital Infrastructure','Market','Onboarding journey for producers, owners, originators, suppliers and custodians.','Submission|Due diligence|Verification|Valuation|Custody|Registry / passport|Reserve controls|Tokenization path'),
(36,'enterprise-services','Enterprise Services','Build Real-World Asset Infrastructure at Institutional Scale','Enterprise','Overview of modular onboarding, registry, compliance, tokenization, reserve and reporting services.','Onboarding|Registry|Passports|Verification integrations|Custody integrations|Compliance|Tokenization|Reporting|APIs'),
(37,'enterprise-tokenization','Enterprise Tokenization Services','Tokenization Infrastructure for Real-World Assets','Enterprise','B2B architecture for institutions requiring asset-tokenization infrastructure.','Data models|Smart contracts|Rules engine|Custody integration|Reserve integration|Participant controls|Reporting|APIs|Deployment'),
(38,'technology-licensing','Technology Licensing & White-Label','Launch Your Own Real-World Asset Platform','Enterprise','White-label and licensing architecture with configurable modules, branding, APIs and operational support.','White-label platform|Branding|API access|Registry|Passport engine|Compliance|Tokenization|Reserve engine|Portals|Analytics'),
(39,'future-of-rwa','Future of Real-World Asset Infrastructure','Invest in the Future of Real-World Asset Infrastructure','Investor / Strategy','Strategic platform thesis with approved language only and clear separation from any offering.','Market problem|Infrastructure opportunity|Initial programs|Scalable asset model|Enterprise model|Technology moat|Roadmap|Risks'),
(40,'resources','Resources','Knowledge. Transparency. Confidence.','Resources','Central resource hub for documentation, methodology, platform topics, compliance and legal material.','Documentation|Whitepaper|Investor presentation|Program methodology|Verification|Custody|Passports|Reserves|FAQ|Legal'),
(41,'documentation','Documentation','Documentation','Resources','Version-controlled library for platform, technology, asset, evidence, compliance, participation and legal documents.','Platform documents|Asset documents|Certificates|Reserve reports|Compliance|Enterprise|Policies|Legal|Version history'),
(42,'whitepaper','Whitepaper','ReserveChain Whitepaper - In Preparation','Resources','Two-stage institutional whitepaper workflow with approved facts and clearly marked pending sections.','Status|Purpose|Planned chapters|Architecture|Asset framework|Verification / custody / reserves|Compliance|Roadmap|Risk|Governance'),
(43,'investor-presentation','Investor Presentation','Investor Presentation - Real-World Asset Infrastructure','Resources','Presentation area for approved platform, program, roadmap, governance and risk information.','Platform thesis|Initial programs|Expansion|Infrastructure modules|Business model|Roadmap|Risks|Governance|Versioning'),
(44,'faq','Frequently Asked Questions','Frequently Asked Questions','Resources','Structured FAQ spanning platform, assets, verification, custody, reserves, tokenization, participation and risk.','Platform|Copper Powder|Nickel Wire|Verification|Custody|Proof of Reserves|Passports|Tokenization|KYC|Redemption|Enterprise|Risk'),
(45,'risk-disclosure','Risk Disclosure','Understand the Risks Before Participating','Legal / Risk','RWA-specific risk framework covering asset, valuation, custody, counterparty, technology, regulation and redemption.','Asset authenticity|Valuation|Liquidity|Custody|Insurance|Counterparty|Logistics|Regulation|Smart contracts|Wallets|Jurisdiction|Taxes|Redemption'),
(46,'anti-fraud','Anti-Fraud Notice','Protect Yourself. Verify Official Communications.','Legal / Security','Anti-fraud guidance covering impersonation, fake presales, wallets, phishing and document fraud.','Official channels|Fake-token warning|Fake presales|Impersonation|Wallet scams|Phishing|Document fraud|Reporting'),
(47,'legal','Legal & Disclosures','Legal & Disclosures','Legal','Central legal hub for current operator information, pre-launch status, risks, terms and future offering documentation.','Operator information|Pre-launch status|Risk disclosure|Participation restrictions|Terms|Privacy|Disclaimers|Third-party data'),
(48,'privacy','Privacy Policy','Privacy Policy','Legal','Privacy architecture for public site, account, waitlist and future KYC/KYB processing.','Data controller|Collected data|Purposes|Service providers|Transfers|Retention|Cookies|Security|Rights|Marketing|Changes'),
(49,'terms','Terms of Use','Terms of Use','Legal','Website terms covering pre-launch status, eligibility, data limitations, acceptable use, IP and liability.','Operator|Pre-launch status|Eligibility|Jurisdictions|No-offer language|Asset data|Third parties|Acceptable use|IP|Liability|Updates'),
(50,'support','Support','ReserveChain Support','Support','Support hub for public information, future accounts, asset programs, enterprise users, security and ticket routing.','Platform help|Account support|Asset questions|Enterprise support|Documentation|Status|Security reporting|Contact form|FAQ routing'),
(51,'participant-portal','Participant Portal','ReserveChain Participant Portal','Portal','Participant portal architecture with profile, compliance status, programs, documents, reserve information and gated future modules.','Profile|KYC/KYB status|Available programs|Holdings|Passports|Documents|Transactions|Notices|Reserve information|Redemption access|Security settings'),
]



def php_quote(value):
    if value is None:
        return 'null'
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, (int,float)):
        return str(value)
    return "'" + str(value).replace('\\','\\\\').replace("'", "\\'") + "'"

def php_export(value, indent=0):
    pad=' ' * indent
    if isinstance(value, dict):
        parts=[]
        for k,v in value.items():
            parts.append(' '*(indent+2)+php_quote(k)+' => '+php_export(v, indent+2))
        return "[\n" + ",\n".join(parts) + "\n" + pad + "]"
    if isinstance(value, list):
        parts=[' '*(indent+2)+php_export(v, indent+2) for v in value]
        return "[\n" + ",\n".join(parts) + "\n" + pad + "]"
    return php_quote(value)

def slugify(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def section_body(section, page_name, category, summary):
    s=section.lower()
    lead=f"For {page_name}, the {section} section is scoped to this page's specific purpose. "
    if any(k in s for k in ['verification','laboratory','assay','certificate','testing','inspection','sampling']):
        return lead+'It defines the evidence path from source document or physical test through review, approval, publication status and later re-verification. Laboratory or inspection evidence is one source record and does not automatically establish ownership, custody, valuation or reserve eligibility.'
    if any(k in s for k in ['custody','warehouse','vault','storage','release']):
        return lead+'It maps proposed chain-of-custody controls, identifiable inventory records, access permissions, supporting receipts, inspection history and controlled release. Provider names and active custody status remain unpublished until approved documentation exists.'
    if any(k in s for k in ['reserve','reconcile','coverage','inventory','supply']):
        return lead+'It describes how approved physical inventory, eligible reserve units and any authorized token-supply inputs are reconciled with dated evidence, exceptions and history. No live reserve quantity or coverage ratio is shown without approved source data.'
    if any(k in s for k in ['token','erc','smart contract','issuance','burn','transfer','settlement']):
        return lead+'It presents the planned ERC-20 lifecycle and its controls, including approved program linkage, role-governed issuance, reconciliation and retirement/burn paths. Pricing, supply, ownership rights, transferability and contract addresses remain configurable and inactive until written authorization.'
    if any(k in s for k in ['kyc','kyb','aml','sanction','eligib','jurisdiction','compliance','source of funds','enhanced']):
        return lead+'It is implemented as a configurable compliance workflow rather than a hard-coded legal conclusion, supporting identity/entity checks, sanctions and jurisdiction rules, review states, evidence retention and auditable decisions after policy approval.'
    if any(k in s for k in ['risk','fraud','phishing','impersonation','warning']):
        return lead+'It makes the relevant risk or anti-fraud control explicit, separates verified project communications from unsupported claims, and routes users toward approved disclosures and reporting channels without promising returns, liquidity, regulatory status or loss protection.'
    if any(k in s for k in ['document','whitepaper','presentation','archive','version','policy','terms','privacy']):
        return lead+'It uses version-controlled document records with publication state, date, visibility and approval metadata. Draft or under-review material stays private/non-indexable while public releases preserve historical versions.'
    if any(k in s for k in ['passport','registry','asset id','provenance','history']):
        return lead+'It is backed by the asset-registry model so identifiers, specifications, evidence references and status history come from one canonical record. Public views expose only approved fields while private or pending evidence remains permission-controlled.'
    if any(k in s for k in ['redemption','delivery','logistics','collection','customs']):
        return lead+'It describes a future stage-gated physical-redemption workflow from eligibility review through settlement/burn, custody release and delivery documentation. Fees, minimums, legal rights and logistics rules remain inactive until approved.'
    return lead+f"It develops this component of the {category.lower()} experience around the page purpose - {summary.rstrip('.').lower()} - while factual asset, legal, custody, reserve and token status remains dependent on approved source records."

records=[]
for num,key,name,title,category,summary,section_text in pages:
    sections=[]
    for i,s in enumerate(section_text.split('|'),1):
        sections.append({'title':s,'body':section_body(s,name,category,summary)})
    records.append({'number':num,'key':key,'slug':slugify(key),'name':name,'title':title,'category':category,'summary':summary,'sections':sections})

assets=[
 {'id':'RC-PROG-CU-001','slug':'copper-powder','name':'Ultrafine Copper Powder','material':'Copper','form':'Ultrafine powder','status':'PRE-LAUNCH / EVIDENCE REVIEW','purity':'99.9999%','diameter':None,'lot':'#03-K-07','certificate_no':'0004512','certificate_date':'04.07.2022','laboratory':'IGAS research','tokenization_status':'Not issued','custody_status':'Pending owner-approved documentation','reserve_status':'No live reserve claim published','passport_id':'RC-DAP-CU-03K07-DEMO','certificate_image':'assets/img/copper-certificate-preview.svg','evidence_note':'Supplied IGAS Certificate of Analysis supports the displayed purity and lot reference. It is not by itself proof of current ownership, custody, insurance or reserves.'},
 {'id':'RC-PROG-NI-001','slug':'nickel-wire','name':'Ultrafine Nickel Wire 0.025 mm','material':'Nickel','form':'Wire','status':'PRE-LAUNCH / EVIDENCE REVIEW','purity':'99.9807%','diameter':'0.025 mm','lot':'120/NP1','certificate_no':'0004368','certificate_date':'19.10.2021','laboratory':'IGAS research','tokenization_status':'Not issued','custody_status':'Pending owner-approved documentation','reserve_status':'No live reserve claim published','passport_id':'RC-DAP-NI-120NP1-DEMO','certificate_image':'assets/img/nickel-certificate-preview.svg','evidence_note':'Supplied IGAS Certificate of Analysis supports the displayed purity and wire diameter. It is not by itself proof of current ownership, custody, insurance or reserves.'}
]
settings={
 'project':'ReserveChain.io',
 'mode':'PRE-LAUNCH',
 'corporate_status':'Swiss corporate and issuance structure in development.',
 'mandatory_disclosure':'ReserveChain is currently in development. No tokens are being offered or sold through this website. Registration of interest does not constitute an investment, token purchase, asset reservation, price reservation, token allocation or entitlement to participate in any future offering. Any future availability will be subject to the final Swiss corporate and legal structure, definitive offering documentation, asset verification, custody arrangements, jurisdictional eligibility, KYC/KYB, sanctions screening and final approval.',
 'languages':['English','Spanish','Italian'],
 'chain':['Physical Asset','Verify','Value','Custody','Digital Asset Passport','Tokenize','Reconcile','Participate','Redeem'],
 'future_categories':['Precious Metals','Gemstone Assets','Energy Assets','Real Estate Opportunities','Art & Collectibles','Other Assets']
}
data={'settings':settings,'assets':assets,'pages':records}
(ROOT/'public-demo/public/assets/js').mkdir(parents=True,exist_ok=True)
(ROOT/'docs').mkdir(parents=True,exist_ok=True)
(ROOT/'wordpress/wp-content/plugins/reservechain-core/includes').mkdir(parents=True,exist_ok=True)
(ROOT/'public-demo/public/assets/js/site-data.js').write_text('window.RC_DATA = '+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
(ROOT/'docs/site-data.json').write_text(json.dumps(data,separators=(',',':')),encoding='utf-8')
php = "<?php\nif (!defined('ABSPATH')) { exit; }\nreturn " + php_export(records) + ";\n"
(ROOT/'wordpress/wp-content/plugins/reservechain-core/includes/page-definitions.php').write_text(php,encoding='utf-8')
print('generated',len(records),'pages and runtime definitions')
