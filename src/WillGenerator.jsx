import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import './index.css';

const WillGenerator = () => {
  const [formData, setFormData] = useState({
    testatorName: '',
    occupation: '',
    address: '',
    parish: '',
    executor1: { name: '', relationship: '', occupation: '', address: '', parish: '' },
    executor2: { name: '', relationship: '', occupation: '', address: '', parish: '' },
    funeralDetails: '',
    clothingDetails: '',
    remainsDetails: '',
    songs: ['', ''],
    prefix: '',
  suffix: '',
  gender: '',
  maritalStatus: '',
  livingChildren: '',
  livingGrandchildren: '',
  spouse: { fullName: '', relation: '', occupation: '' },
  children: [],
  hasDeceasedFamilyMembers: '',
  deceasedFamilyMembers: [],
  selectedPossession: '',
  properties: [],
  shares: [],
  insurance: [],
  bankAccounts: [],
  motorVehicles: [],
  unpaidSalary: {},
  nhtContributions: {},
  jewellery: {},
  furniture: {},
  paintings: {},
  firearm: {},
  residualEstate: {},

    // ... (existing fields)
    otherBeneficiaries: 'none',
    additionalBeneficiaries: [],
    minorChildren: [],
    executor1: { name: '', relationship: '', email: '', occupation: '', address: '', parish: '' },
    executor2: { name: '', relationship: '', email: '', occupation: '', address: '', parish: '' },
    executor3: { name: '', relationship: '', email: '', occupation: '', address: '', parish: '' },
    witness1: { name: '', relationship: '', email: '', occupation: '', address: '', parish: '' },
    witness2: { name: '', relationship: '', email: '', occupation: '', address: '', parish: '' },
    // ... (rest of the existing fields)
 
    properties: [
      { address: '', parish: '', volume: '', folio: '', beneficiary: '' },
      { address: '', parish: '', volume: '', folio: '', beneficiary: '' },
      { address: '', parish: '', volume: '', folio: '', beneficiary: '' },
    ],
    shares: [
      { company: '', country: '', exchange: '', accountNumber: '', beneficiary: '' },
      { company: '', country: '', exchange: '', accountNumber: '', beneficiary: '' },
    ],
    insurance: [
      { policyNumber: '', company: '', address: '', country: '', beneficiary: '' },
      { policyNumber: '', company: '', address: '', country: '', beneficiary: '' },
    ],
    bankAccounts: [
      { accountNumber: '', bank: '', address: '', country: '', beneficiary: '' },
      { accountNumber: '', bank: '', address: '', country: '', beneficiary: '' },
      { accountNumber: '', bank: '', address: '', country: '', beneficiary: '' },
    ],
    vehicles: [
      { color: '', make: '', model: '', licensePlate: '', engineNumber: '', chassisNumber: '', beneficiary: '' },
      { color: '', make: '', model: '', licensePlate: '', engineNumber: '', chassisNumber: '', beneficiary: '' },
      { color: '', make: '', model: '', licensePlate: '', engineNumber: '', chassisNumber: '', beneficiary: '' },
    ],
    unpaidSalary: { employer: '', employerAddress: '', beneficiary: '' },
    nhtContributions: { nhtNumber: '', taxNumber: '', beneficiary: '' },
    jewellery: { description: '', beneficiary: '' },
    furniture: { beneficiary: '' },
    paintings: { beneficiary: '' },
    firearm: { serialNumber: '', licenseNumber: '', beneficiary: '' },
    residualEstate: { beneficiaries: '' },
    signatureDate: '',
    witnesses: [
      { name: '', address: '', occupation: '' },
      { name: '', address: '', occupation: '' },
    ],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 11;

  // handleinput change //


  const handleInputChange = (e, section, field, index = null) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormData(prevData => {
      // Handle possessions
      if (section === 'possessions' && index !== null) {
        const newPossessions = [...prevData.possessions];
        if (!newPossessions[index]) {
          newPossessions[index] = { type: prevData.selectedPossession, details: {} };
        }
        newPossessions[index].details[field] = value;
        return { ...prevData, possessions: newPossessions };
      }
      
      // Handle arrays (e.g., children, witnesses)
      if (section && index !== null) {
        const newArray = [...prevData[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        return { ...prevData, [section]: newArray };
      }
      
      // Handle nested objects (e.g., spouse)
      if (section) {
        return {
          ...prevData,
          [section]: { ...prevData[section], [field]: value }
        };
      }
      
      // Handle top-level fields
      return { ...prevData, [field]: value };
    });
  };



  // generate Pdf //

const generatePDF = async (formData) => {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  const addPage = () => {
    const page = pdfDoc.addPage([612, 792]); // US Letter size
    return { page, width: 612, height: 792 };
  };

  let { page, width, height } = addPage();
  let yOffset = height - 50;
  let pageCount = 1;

  const drawText = (text, { fontSize = 12, font = timesRomanFont, color = rgb(0, 0, 0), underline = false, align = 'left', isUserInput = false }) => {
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    let xOffset = 50;
    if (align === 'center') {
      xOffset = (width - textWidth) / 2;
    } else if (align === 'right') {
      xOffset = width - textWidth - 50;
    }

    page.drawText(text, {
      x: xOffset,
      y: yOffset,
      size: fontSize,
      font: font,
      color: isUserInput ? rgb(0.8, 0, 0) : color,
    });

    if (underline) {
      page.drawLine({
        start: { x: xOffset, y: yOffset - 2 },
        end: { x: xOffset + textWidth, y: yOffset - 2 },
        thickness: 1,
        color: color,
      });
    }

    yOffset -= fontSize + 10;
  };

  const addNewPageIfNeeded = (neededSpace) => {
    if (yOffset - neededSpace < 50) {
      ({ page, width, height } = addPage());
      pageCount++;
      yOffset = height - 50;
      
      page.drawText(`Page - ${pageCount} - of 5`, {
        x: 50,
        y: height - 25,
        size: 10,
        font: timesRomanFont,
      });
      page.drawText('(Please insert Testator\'s signature here)', {
        x: 50,
        y: height - 40,
        size: 8,
        font: timesRomanFont,
      });
      page.drawText('(Please insert Witness #1\'s signature here)', {
        x: 250,
        y: height - 40,
        size: 8,
        font: timesRomanFont,
      });
      page.drawText('(Please insert Witness #2\'s signature here)', {
        x: 450,
        y: height - 40,
        size: 8,
        font: timesRomanFont,
      });

      yOffset = height - 60;
    }
  };

  // Add initial page number and signature lines
  page.drawText('Page - 1 - of 5', {
    x: 50,
    y: height - 25,
    size: 10,
    font: timesRomanFont,
  });
  page.drawText('(Please insert Testator\'s signature here)', {
    x: 50,
    y: height - 40,
    size: 8,
    font: timesRomanFont,
  });
  page.drawText('(Please insert Witness #1\'s signature here)', {
    x: 250,
    y: height - 40,
    size: 8,
    font: timesRomanFont,
  });
  page.drawText('(Please insert Witness #2\'s signature here)', {
    x: 450,
    y: height - 40,
    size: 8,
    font: timesRomanFont,
  });

  yOffset = height - 60;

  // Title
  drawText('LAST WILL AND TESTAMENT', { fontSize: 18, font: timesBoldFont, underline: true, align: 'center' });
  yOffset -= 20;

  // Testator Information
  drawText('THIS IS THE LAST WILL AND TESTAMENT of me', { fontSize: 12 });
  drawText(formData.testatorName, { fontSize: 12, isUserInput: true });
  drawText(', a', { fontSize: 12 });
  drawText(formData.occupation, { fontSize: 12, isUserInput: true });
  drawText('whose address is', { fontSize: 12 });
  drawText(formData.address, { fontSize: 12, isUserInput: true });
  drawText('in the parish of', { fontSize: 12 });
  drawText(formData.parish, { fontSize: 12, isUserInput: true });
  yOffset -= 10;

  // Revocation Clause
  drawText('1. I HEREBY REVOKE all Wills and Testamentary dispositions heretofore by me made AND', { fontSize: 12 });
  drawText('DECLARE this to be my Last Will and Testament.', { fontSize: 12 });
  yOffset -= 10;

  // Executors
  addNewPageIfNeeded(150);
  drawText('2. APPOINTMENT OF EXECUTORS', { fontSize: 14, font: timesBoldFont });
  drawText('I HEREBY APPOINT', { fontSize: 12 });
  drawText(formData.executor1.name, { fontSize: 12, isUserInput: true });
  drawText(', my', { fontSize: 12 });
  drawText(formData.executor1.relationship, { fontSize: 12, isUserInput: true });
  drawText(formData.executor1.occupation, { fontSize: 12, isUserInput: true });
  drawText(', of', { fontSize: 12 });
  drawText(formData.executor1.address, { fontSize: 12, isUserInput: true });
  drawText(', in the parish of', { fontSize: 12 });
  drawText(formData.executor1.parish, { fontSize: 12, isUserInput: true });
  drawText('AND', { fontSize: 12 });
  drawText(formData.executor2.name, { fontSize: 12, isUserInput: true });
  drawText(', my', { fontSize: 12 });
  drawText(formData.executor2.relationship, { fontSize: 12, isUserInput: true });
  drawText(formData.executor2.occupation, { fontSize: 12, isUserInput: true });
  drawText(', of', { fontSize: 12 });
  drawText(formData.executor2.address, { fontSize: 12, isUserInput: true });
  drawText(', in the parish of', { fontSize: 12 });
  drawText(formData.executor2.parish, { fontSize: 12, isUserInput: true });
  drawText('to be the Executor and Trustee of this my Will (hereinafter referred to as "my Trustee").', { fontSize: 12 });
  yOffset -= 10;

  // Debts and Expenses
  drawText('3. I DIRECT that as soon as possible after my decease my Trustees shall pay all my just debts, funeral,', { fontSize: 12 });
  drawText('tombstone and testamentary expenses.', { fontSize: 12 });
  yOffset -= 10;

  // Funeral Arrangements
  addNewPageIfNeeded(200);
  drawText('4. FUNERAL AND BURIAL ARRANGEMENTS', { fontSize: 14, font: timesBoldFont });
  drawText('I HEREBY DIRECT that my body be prepared for burial in an appropriate manner and that', { fontSize: 12 });
  drawText('my funeral expenses and any debts be paid out of my estate, along with the following:', { fontSize: 12 });
  drawText('a. That I be', { fontSize: 12 });
  drawText(formData.funeralDetails, { fontSize: 12, isUserInput: true });
  drawText('b. That be clothed in', { fontSize: 12 });
  drawText(formData.clothingDetails, { fontSize: 12, isUserInput: true });
  drawText('c. That my remains be placed', { fontSize: 12 });
  drawText(formData.remainsDetails, { fontSize: 12, isUserInput: true });
  drawText('d. That the following songs be included in my funeral programme', { fontSize: 12 });
  drawText('e. That the following song is played at my wedding-', { fontSize: 12 });
  formData.songs.forEach((song, index) => {
    drawText(`- ${song}`, { fontSize: 12, isUserInput: true });
  });
  yOffset -= 10;

  // Bequests
  addNewPageIfNeeded(100);
  drawText('5. I GIVE DEVISE AND BEQUEATH:', { fontSize: 14, font: timesBoldFont });

  // Properties
  drawText('a. PROPERTY', { fontSize: 12, font: timesBoldFont });
  formData.properties.forEach((property, index) => {
    drawText(`${index === 0 ? 'i. 1st' : index === 1 ? 'ii. 2nd' : 'iii. 3rd'} Property- situate at`, { fontSize: 12 });
    drawText(property.address, { fontSize: 12, isUserInput: true });
    drawText(', in the parish of', { fontSize: 12 });
    drawText(property.parish, { fontSize: 12, isUserInput: true });
    drawText('registered at', { fontSize: 12 });
    drawText(`${property.volume} and ${property.folio}`, { fontSize: 12, isUserInput: true });
    drawText('of the Register Book of', { fontSize: 12 });
    drawText('Titles to', { fontSize: 12 });
    drawText(property.beneficiary, { fontSize: 12, isUserInput: true });
    yOffset -= 10;
  });

  // Shares and Stocks
  addNewPageIfNeeded(150);
  drawText('b. SHARES AND STOCKS', { fontSize: 12, font: timesBoldFont });
  formData.shares.forEach((share, index) => {
    drawText(`${index + 1}. Shares in`, { fontSize: 12 });
    drawText(share.company, { fontSize: 12, isUserInput: true });
    drawText('held in', { fontSize: 12 });
    drawText(share.country, { fontSize: 12, isUserInput: true });
    drawText('at', { fontSize: 12 });
    drawText(share.exchange, { fontSize: 12, isUserInput: true });
    drawText('in account numbered', { fontSize: 12 });
    drawText(share.accountNumber, { fontSize: 12, isUserInput: true });
    drawText('to', { fontSize: 12 });
    drawText(share.beneficiary, { fontSize: 12, isUserInput: true });
    yOffset -= 10;
  });

  // Insurance
  addNewPageIfNeeded(150);
  drawText('c. INSURANCE', { fontSize: 12, font: timesBoldFont });
  formData.insurance.forEach((policy, index) => {
    drawText(`${index === 0 ? 'i' : 'j'}. Proceeds of insurance policy numbered`, { fontSize: 12 });
    drawText(policy.policyNumber, { fontSize: 12, isUserInput: true });
    drawText(', held at', { fontSize: 12 });
    drawText(policy.company, { fontSize: 12, isUserInput: true });
    drawText('located at', { fontSize: 12 });
    drawText(`${policy.address}, ${policy.country}`, { fontSize: 12, isUserInput: true });
    drawText('to', { fontSize: 12 });
    drawText(policy.beneficiary, { fontSize: 12, isUserInput: true });
    yOffset -= 10;
  });

  // Bank Accounts
  addNewPageIfNeeded(200);
  drawText('d. BANK ACCOUNTS', { fontSize: 12, font: timesBoldFont });
  formData.bankAccounts.forEach((account, index) => {
    drawText(`${index + 1}. Proceeds of bank account numbered`, { fontSize: 12 });
    drawText(account.accountNumber, { fontSize: 12, isUserInput: true });
    drawText(', held at', { fontSize: 12 });
    drawText(account.bank, { fontSize: 12, isUserInput: true });
    drawText('located at', { fontSize: 12 });
    drawText(`${account.address}, ${account.country}`, { fontSize: 12, isUserInput: true });
    drawText('to', { fontSize: 12 });
    drawText(account.beneficiary, { fontSize: 12, isUserInput: true });
    yOffset -= 10;
  });

  // Motor Vehicles
  addNewPageIfNeeded(200);
  drawText('e. MOTOR VEHICLE', { fontSize: 12, font: timesBoldFont });
  formData.vehicles.forEach((vehicle, index) => {
    drawText(`${index + 1}.`, { fontSize: 12 });
    drawText(`${vehicle.color} ${vehicle.make} ${vehicle.model}`, { fontSize: 12, isUserInput: true });
    drawText('Motor vehicle bearing', { fontSize: 12 });
    drawText('Licence plate number', { fontSize: 12 });
    drawText(vehicle.licensePlate, { fontSize: 12, isUserInput: true });
    drawText('and engine and chassis numbers', { fontSize: 12 });
    drawText(`${vehicle.engineNumber} and ${vehicle.chassisNumber}`, { fontSize: 12, isUserInput: true });
    drawText('to', { fontSize: 12 });
    drawText(vehicle.beneficiary, { fontSize: 12, isUserInput: true });
    yOffset -= 10;
  });

  // Other Bequests
  addNewPageIfNeeded(300);
  drawText('f. UNPAID SALARY AND/EMOLUMENTS', { fontSize: 12, font: timesBoldFont });
  drawText('Unpaid salary and/or emoluments with my employer,', { fontSize: 12 });
  drawText(formData.unpaidSalary.employer, { fontSize: 12, isUserInput: true });
  drawText('located at', { fontSize: 12 });
  drawText(formData.unpaidSalary.employerAddress, { fontSize: 12, isUserInput: true });
  drawText('to', { fontSize: 12 });
  drawText(formData.unpaidSalary.beneficiary, { fontSize: 12, isUserInput: true });
  yOffset -= 10;

  drawText('g. NATIONAL HOUSING TRUST(NHT) CONTRIBUTIONS', { fontSize: 12, font: timesBoldFont });
  drawText('Refund of National Housing Trust Contributions', { fontSize: 12 });
  drawText(`(${formData.nhtContributions.nhtNumber} and`, { fontSize: 12, isUserInput: true });
  drawText('Tax Registration Number', { fontSize: 12 });
  drawText(formData.nhtContributions.taxNumber, { fontSize: 12, isUserInput: true });
  drawText(') to', { fontSize: 12 });
  drawText(formData.nhtContributions.beneficiary, { fontSize: 12, isUserInput: true });
  yOffset -= 10;

  drawText('h. JEWELLERY', { fontSize: 12, font: timesBoldFont });
drawText('h. JEWELLERY', { fontSize: 12, font: timesBoldFont });
  drawText(formData.jewellery.description, { fontSize: 12, isUserInput: true });
  drawText('described as my Jewellery to', { fontSize: 12 });
  drawText(formData.jewellery.beneficiary, { fontSize: 12, isUserInput: true });
  yOffset -= 10;

  drawText('i. FURNITURE', { fontSize: 12, font: timesBoldFont });
  drawText('Furniture to', { fontSize: 12 });
  drawText(formData.furniture.beneficiary, { fontSize: 12, isUserInput: true });
  yOffset -= 10;

  drawText('j. PAINTINGS', { fontSize: 12, font: timesBoldFont });
  drawText('Paintings to', { fontSize: 12 });
  drawText(formData.paintings.beneficiary, { fontSize: 12, isUserInput: true });
  yOffset -= 10;

  drawText('k. FIREARM', { fontSize: 12, font: timesBoldFont });
  drawText('Firearm bearing serial and firearm licence numbers', { fontSize: 12 });
  drawText(`${formData.firearm.serialNumber} and ${formData.firearm.licenseNumber}`, { fontSize: 12, isUserInput: true });
  drawText('to', { fontSize: 12 });
  drawText(formData.firearm.beneficiary, { fontSize: 12, isUserInput: true });
  yOffset -= 10;

  // Residual Estate
  addNewPageIfNeeded(100);
  drawText('6. RESIDUAL ESTATE', { fontSize: 14, font: timesBoldFont });
  drawText('I give, devise and bequeath all the rest, residue and remainder of my estate, including any proceeds', { fontSize: 12 });
  drawText('from the sale of assets to', { fontSize: 12 });
  drawText(formData.residualEstate.beneficiaries, { fontSize: 12, isUserInput: true });
  drawText('in equal shares.', { fontSize: 12 });
  yOffset -= 20;

  // Signature and Date
  addNewPageIfNeeded(150);
  drawText('IN WITNESS WHEREOF I have hereunto set my hand and seal this', { fontSize: 12 });
  drawText(formData.signatureDate, { fontSize: 12, isUserInput: true });
  yOffset -= 30;
  drawText('____________________________', { fontSize: 12 });
  drawText('(Testator to sign here)', { fontSize: 10 });
  yOffset -= 20;

  drawText('SIGNED by the Testator the said', { fontSize: 12 });
  drawText(formData.testatorName, { fontSize: 12, isUserInput: true });
  drawText(', a', { fontSize: 12 });
  drawText(formData.occupation, { fontSize: 12, isUserInput: true });
  drawText('of', { fontSize: 12 });
  drawText(formData.address, { fontSize: 12, isUserInput: true });
  drawText(', in', { fontSize: 12 });
  drawText('the parish of', { fontSize: 12 });
  drawText(formData.parish, { fontSize: 12, isUserInput: true });
  drawText(', as my Last Will and Testament I declare that I have signed and', { fontSize: 12 });
  drawText('executed this Last Will and Testament willingly and in the presence of the following witnesses, who are', { fontSize: 12 });
  drawText('present at the same time and who have signed as witnesses in my presence:', { fontSize: 12 });
  yOffset -= 20;

  // Witnesses
  drawText('WITNESSES', { fontSize: 14, font: timesBoldFont });
  formData.witnesses.forEach((witness, index) => {
    drawText('Name and', { fontSize: 12 });
    drawText('Signature:', { fontSize: 12 });
    drawText('____________________________', { fontSize: 12 });
    drawText(witness.name, { fontSize: 12, isUserInput: true });
    yOffset -= 10;
    drawText('Address:', { fontSize: 12 });
    drawText(witness.address, { fontSize: 12, isUserInput: true });
    yOffset -= 10;
    drawText('Occupation:', { fontSize: 12 });
    drawText(witness.occupation, { fontSize: 12, isUserInput: true });
    yOffset -= 20;
  });

  drawText('Witnesses', { fontSize: 12 });
  drawText('to sign', { fontSize: 12 });
  drawText('here.', { fontSize: 12 });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};


const handleGeneratePDF = async (e) => {
  e.preventDefault();
  try {
    const pdfBytes = await generatePDF(formData);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'last_will_and_testament.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

// add //

const addBeneficiary = () => {
    setFormData(prevData => ({
      ...prevData,
      additionalBeneficiaries: [
        ...prevData.additionalBeneficiaries,
        { type: 'individual', fullName: '', relationship: '', email: '', address: '', parish: '' }
      ]
    }));
  };
  
  const removeBeneficiary = (index) => {
    setFormData(prevData => ({
      ...prevData,
      additionalBeneficiaries: prevData.additionalBeneficiaries.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generatePDF();
  };

  const renderInput = (section, field, label, index = null) => (
    <div className="mb-4" key={`${section}-${field}-${index}`}>
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`${section}-${field}-${index}`}>
        {label}
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id={`${section}-${field}-${index}`}
        type="text"
        value={index !== null ? formData[section][index][field] : (section ? formData[section][field] : formData[field])}
        onChange={(e) => handleInputChange(e, section, field, index)}
      />
    </div>
  );

     // possesions code // 

     const addPossession = () => {
        if (formData.selectedPossession) {
          setFormData(prevData => ({
            ...prevData,
            possessions: [...(prevData.possessions || []), { type: prevData.selectedPossession, details: {} }],
            selectedPossession: '',
          }));
        }
      };
      
      const deletePossession = (index) => {
        setFormData(prevData => ({
          ...prevData,
          possessions: prevData.possessions.filter((_, i) => i !== index),
        }));
      };
      
      const renderPossessionFields = (possession, index) => {
        switch (possession.type) {
          case 'property':
            return (
              <>
                {renderInput('possessions', 'address', 'Address', index)}
                {renderInput('possessions', 'parish', 'Parish', index)}
                {renderInput('possessions', 'volume', 'Volume', index)}
                {renderInput('possessions', 'folio', 'Folio', index)}
                {renderInput('possessions', 'beneficiary', 'Beneficiary', index)}
              </>
            );
          case 'shares':
            return (
              <>
                {renderInput('possessions', 'company', 'Company', index)}
                {renderInput('possessions', 'country', 'Country', index)}
                {renderInput('possessions', 'exchange', 'Exchange', index)}
                {renderInput('possessions', 'accountNumber', 'Account Number', index)}
                {renderInput('possessions', 'beneficiary', 'Beneficiary', index)}
              </>
            );
          case 'insurance':
            return (
              <>
                {renderInput('possessions', 'policyNumber', 'Policy Number', index)}
                {renderInput('possessions', 'company', 'Company', index)}
                {renderInput('possessions', 'address', 'Address', index)}
                {renderInput('possessions', 'country', 'Country', index)}
                {renderInput('possessions', 'beneficiary', 'Beneficiary', index)}
              </>
            );
          case 'bankAccounts':
            return (
              <>
                {renderInput('possessions', 'accountNumber', 'Account Number', index)}
                {renderInput('possessions', 'bank', 'Bank Name', index)}
                {renderInput('possessions', 'address', 'Address', index)}
                {renderInput('possessions', 'country', 'Country', index)}
                {renderInput('possessions', 'beneficiary', 'Beneficiary', index)}
              </>
            );
          case 'motorVehicle':
            return (
              <>
                {renderInput('possessions', 'make', 'Make', index)}
                {renderInput('possessions', 'model', 'Model', index)}
                {renderInput('possessions', 'licensePlate', 'License Plate', index)}
                {renderInput('possessions', 'engineNumber', 'Engine Number', index)}
                {renderInput('possessions', 'chassisNumber', 'Chassis Number', index)}
                {renderInput('possessions', 'beneficiary', 'Beneficiary', index)}
              </>
            );
          case 'unpaidSalary':
            return (
              <>
                {renderInput('possessions', 'employer', 'Employer', index)}
                {renderInput('possessions', 'employerAddress', 'Employer Address', index)}
                {renderInput('possessions', 'beneficiary', 'Beneficiary', index)}
              </>
            );
          case 'nhtContributions':
            return (
              <>
                {renderInput('possessions', 'nhtNumber', 'NHT Number', index)}
                {renderInput('possessions', 'taxNumber', 'Tax Registration Number', index)}
                {renderInput('possessions', 'beneficiary', 'Beneficiary', index)}
              </>
            );
          case 'jewellery':
          case 'furniture':
          case 'paintings':
          case 'firearm':
          case 'residualEstate':
            return (
              <>
                {renderInput('possessions', 'description', 'Description', index)}
                {renderInput('possessions', 'beneficiary', 'Beneficiary', index)}
              </>
            );
          default:
            return null;
        }
      };


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
            <section>
            <h2 className="text-2xl font-semibold mb-4">Testator Information</h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Prefix</label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.prefix || ''}
                  onChange={(e) => handleInputChange(e, null, 'prefix')}
                >
                  <option value="">Select...</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>
              <div className="col-span-2">
                {renderInput(null, 'testatorName', 'Full Name')}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Suffix</label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.suffix || ''}
                  onChange={(e) => handleInputChange(e, null, 'suffix')}
                >
                  <option value="">Select...</option>
                  <option value="Jr">Jr</option>
                  <option value="Sr">Sr</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
              <div className="flex space-x-4">
                {['Male', 'Female', 'Neutral'].map((gender) => (
                  <label key={gender} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="gender"
                      value={gender.toLowerCase()}
                      checked={formData.gender === gender.toLowerCase()}
                      onChange={(e) => handleInputChange(e, null, 'gender')}
                    />
                    <span className="ml-2">{gender}</span>
                  </label>
                ))}
              </div>
            </div>
            {renderInput(null, 'occupation', 'Occupation')}
            {renderInput(null, 'address', 'Address')}
            {renderInput(null, 'parish', 'Parish')}
          </section>
        );
      case 2:
        return (
            <section>
            <h2 className="text-2xl font-semibold mb-4">Family Status</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Marital Status</label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.maritalStatus || ''}
                onChange={(e) => handleInputChange(e, null, 'maritalStatus')}
              >
                <option value="">Select...</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
                <option value="domesticPartnership">Domestic Partnership</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Living Children</label>
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="livingChildren"
                      value={option.toLowerCase()}
                      checked={formData.livingChildren === option.toLowerCase()}
                      onChange={(e) => handleInputChange(e, null, 'livingChildren')}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Living Grandchildren</label>
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="livingGrandchildren"
                      value={option.toLowerCase()}
                      checked={formData.livingGrandchildren === option.toLowerCase()}
                      onChange={(e) => handleInputChange(e, null, 'livingGrandchildren')}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
        );
      case 3:
        return (
            <section>
            <h2 className="text-2xl font-semibold mb-4">Spouse/Partner Details</h2>
            {renderInput('spouse', 'fullName', 'Full Name')}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Relation</label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.spouse?.relation || ''}
                onChange={(e) => handleInputChange(e, 'spouse', 'relation')}
              >
                <option value="">Select...</option>
                <option value="wife">Wife</option>
                <option value="husband">Husband</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            {renderInput('spouse', 'occupation', 'Occupation')}
          </section>
        );
      case 4:
        return (
            <section>
            <h2 className="text-2xl font-semibold mb-4">Identify Children</h2>
            {formData.children.map((child, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <h3 className="text-xl font-semibold mb-2">Child {index + 1}</h3>
                {renderInput('children', 'fullName', "Child's Full Name", index)}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Relationship</label>
                  <div className="flex space-x-4">
                    {['Son', 'Daughter', 'Gender Neutral Child'].map((relation) => (
                      <label key={relation} className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name={`childRelation-${index}`}
                          value={relation.toLowerCase().replace(' ', '-')}
                          checked={child.relationship === relation.toLowerCase().replace(' ', '-')}
                          onChange={(e) => handleInputChange(e, 'children', 'relationship', index)}
                        />
                        <span className="ml-2">{relation}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {renderInput('children', 'dateOfBirth', "Child's Date of Birth", index, 'date')}
                {renderInput('children', 'email', 'Email Address', index, 'email')}
                {renderInput('children', 'occupation', 'Occupation', index)}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  children: [...formData.children, { fullName: '', relationship: '', dateOfBirth: '', email: '', occupation: '' }]
                });
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Child
            </button>
          </section>
        );
      case 5:
        return (
            <section>
            <h2 className="text-2xl font-semibold mb-4">Deceased Family Members</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Do you have any deceased family members?</label>
              <div className="flex space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="hasDeceasedFamilyMembers"
                      value={option.toLowerCase()}
                      checked={formData.hasDeceasedFamilyMembers === option.toLowerCase()}
                      onChange={(e) => handleInputChange(e, null, 'hasDeceasedFamilyMembers')}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            {formData.hasDeceasedFamilyMembers === 'yes' && (
              <div>
                {formData.deceasedFamilyMembers.map((member, index) => (
                  <div key={index} className="mb-4 p-4 border rounded">
                    <h3 className="text-xl font-semibold mb-2">Deceased Family Member {index + 1}</h3>
                    {renderInput('deceasedFamilyMembers', 'fullName', 'Full Name', index)}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Relationship</label>
                      <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={member.relationship || ''}
                        onChange={(e) => handleInputChange(e, 'deceasedFamilyMembers', 'relationship', index)}
                      >
                        <option value="">Select...</option>
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      deceasedFamilyMembers: [...formData.deceasedFamilyMembers, { fullName: '', relationship: '' }]
                    });
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Add Deceased Family Member
                </button>
              </div>
            )}
          </section>
        );
      case 6:
        return (
            <section>
            <h2 className="text-2xl font-semibold mb-4">Identify Others to be Included in your Will</h2>
            <p className="mb-4">If there are other people or organizations to be included in your Will, you can name them now. You can also add more names later, as you are working through this wizard.</p>
            <p className="mb-4">You should not include your spouse/partner, children, or grandchildren on this page, because they would have been named in previous pages of this wizard.</p>
            <p className="mb-4">By listing the beneficiaries here, it makes it easier to select them later on for receiving a bequest. You are also able to set up a trust for them. They do not appear in your Will unless they are specifically selected in Section 7.</p>
            
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="otherBeneficiaries"
                  value="none"
                  checked={formData.otherBeneficiaries === "none"}
                  onChange={(e) => handleInputChange(e, null, 'otherBeneficiaries')}
                />
                <span className="ml-2">I have no other beneficiaries, or will add them later</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="otherBeneficiaries"
                  value="add"
                  checked={formData.otherBeneficiaries === "add"}
                  onChange={(e) => handleInputChange(e, null, 'otherBeneficiaries')}
                />
                <span className="ml-2">I would like to add beneficiaries now</span>
              </label>
            </div>
  
            {formData.otherBeneficiaries === "add" && (
              <div>
                {formData.additionalBeneficiaries.map((beneficiary, index) => (
                  <div key={index} className="mb-4 p-4 border rounded">
                    <h3 className="text-xl font-semibold mb-2">Beneficiary {index + 1}</h3>
                    <div className="mb-2">
                      <label className="inline-flex items-center mr-4">
                        <input
                          type="radio"
                          className="form-radio"
                          name={`beneficiaryType-${index}`}
                          value="individual"
                          checked={beneficiary.type === "individual"}
                          onChange={(e) => handleInputChange(e, 'additionalBeneficiaries', 'type', index)}
                        />
                        <span className="ml-2">Individual</span>
                      </label>
                      <label className="inline-flex items-center mr-4">
                        <input
                          type="radio"
                          className="form-radio"
                          name={`beneficiaryType-${index}`}
                          value="charity"
                          checked={beneficiary.type === "charity"}
                          onChange={(e) => handleInputChange(e, 'additionalBeneficiaries', 'type', index)}
                        />
                        <span className="ml-2">Charity/Org</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name={`beneficiaryType-${index}`}
                          value="group"
                          checked={beneficiary.type === "group"}
                          onChange={(e) => handleInputChange(e, 'additionalBeneficiaries', 'type', index)}
                        />
                        <span className="ml-2">Group</span>
                      </label>
                    </div>
                    {renderInput('additionalBeneficiaries', 'fullName', 'Full Name', index)}
                    {renderInput('additionalBeneficiaries', 'relationship', 'Relationship', index)}
                    {renderInput('additionalBeneficiaries', 'email', 'Email Address', index)}
                    {renderInput('additionalBeneficiaries', 'address', 'Address', index)}
                    {renderInput('additionalBeneficiaries', 'parish', 'Parish', index)}
                    <button
                      type="button"
                      onClick={() => removeBeneficiary(index)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBeneficiary}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Add
                </button>
              </div>
            )}
          </section>
        );
      case 7:
        return (
            <section>
            <h2 className="text-2xl font-semibold mb-4">Identify Guardians for Minor Children</h2>
            {formData.minorChildren.map((child, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <h3 className="text-xl font-semibold mb-2">{child.fullName}</h3>
                {renderInput('minorChildren', 'guardianName', "Personal guardian's full name", index)}
                {renderInput('minorChildren', 'guardianReason', 'Reason for choosing this guardian', index)}
                {renderInput('minorChildren', 'guardianEmail', 'Email Address', index)}
                {renderInput('minorChildren', 'guardianOccupation', 'Occupation', index)}
                {renderInput('minorChildren', 'guardianAddress', 'Address', index)}
                {renderInput('minorChildren', 'guardianParish', 'Parish', index)}
                <div className="mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={child.guardianIsAdult}
                      onChange={(e) => handleInputChange(e, 'minorChildren', 'guardianIsAdult', index)}
                    />
                    <span className="ml-2">The Guardian of this minor child is 18 above</span>
                  </label>
                </div>
              </div>
            ))}
          </section>
        );
      case 8:
        return (
            <section>
            <h2 className="text-2xl font-semibold mb-4">Executors and Witnesses</h2>
            <p className="mb-4">Here you name the person you would like to be the executor of your Will. This person will be responsible for carrying out your wishes as specified in your Will, including the distribution of your possessions to your beneficiaries.</p>
            <p className="mb-4">You must identify somebody here. Although it is common to list a single executor, you may name up to 3 executors who must then work together to carry out your wishes. On the next page you will be able to name alternate executors to take the place of those unable to serve.</p>
            <p className="mb-4">We understand that you may need to talk to other people before naming an executor. However, if you are stuck, you can name a person now and come back and change it later.</p>
  
            {[1, 2, 3].map((executorNum) => (
              <div key={executorNum} className="mb-8">
                <h3 className="text-xl font-semibold mb-2">{executorNum === 1 ? '1st' : executorNum === 2 ? '2nd' : '3rd'} Executor</h3>
                {renderInput(`executor${executorNum}`, 'name', 'Full Name')}
                {renderInput(`executor${executorNum}`, 'relationship', 'Relationship')}
                {renderInput(`executor${executorNum}`, 'email', 'Email Address')}
                {renderInput(`executor${executorNum}`, 'occupation', 'Occupation')}
                {renderInput(`executor${executorNum}`, 'address', 'Address')}
                {renderInput(`executor${executorNum}`, 'parish', 'Parish')}
              </div>
            ))}
  
            <h3 className="text-xl font-semibold mb-2">Witnesses</h3>
            {[1, 2].map((witnessNum) => (
              <div key={witnessNum} className="mb-8">
                <h4 className="text-lg font-semibold mb-2">{witnessNum === 1 ? '1st' : '2nd'} Witness</h4>
                {renderInput(`witness${witnessNum}`, 'name', 'Full Name')}
                {renderInput(`witness${witnessNum}`, 'relationship', 'Relationship')}
                {renderInput(`witness${witnessNum}`, 'email', 'Email Address')}
                {renderInput(`witness${witnessNum}`, 'occupation', 'Occupation')}
                {renderInput(`witness${witnessNum}`, 'address', 'Address')}
                {renderInput(`witness${witnessNum}`, 'parish', 'Parish')}
              </div>
            ))}
          </section>
        );
        
         
      case 9:
        return (
            <section>
            <h2 className="text-2xl font-semibold mb-4">Funeral Arrangements</h2>
            {renderInput(null, 'funeralDetails', 'Funeral Details')}
            {renderInput(null, 'clothingDetails', 'Clothing Details')}
            {renderInput(null, 'remainsDetails', 'Remains Placement')}
            <h3 className="text-xl font-semibold mb-2">Songs</h3>
            {formData.songs.map((_, index) => (
              renderInput('songs', index, `Song ${index + 1}`, index)
            ))}
          </section>
        );

        

      case 10:
        return (
            <section>
            <h2 className="text-2xl font-semibold mb-4">Add Your Possessions</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Select Possession Type</label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.selectedPossession || ''}
                onChange={(e) => handleInputChange(e, null, 'selectedPossession')}
              >
                <option value="">Select a possession type</option>
                <option value="property">Property</option>
                <option value="shares">Shares and Stocks</option>
                <option value="insurance">Insurance</option>
                <option value="bankAccounts">Bank Accounts</option>
                <option value="motorVehicle">Motor Vehicle</option>
                <option value="unpaidSalary">Unpaid Salary and Emoluments</option>
                <option value="nhtContributions">National Housing Trust (NHT) Contributions</option>
                <option value="jewellery">Jewellery</option>
                <option value="furniture">Furniture</option>
                <option value="paintings">Paintings</option>
                <option value="firearm">Firearm</option>
                <option value="residualEstate">Residual Estate</option>
              </select>
            </div>
      
            <button
              type="button"
              onClick={addPossession}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
            >
              Add Possession
            </button>
      
            {formData.possessions && formData.possessions.map((possession, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <h3 className="text-xl font-semibold mb-2">{possession.type}</h3>
                {renderPossessionFields(possession, index)}
                <button
                  type="button"
                  onClick={() => deletePossession(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </section>
        );

        case 11:
            return(
                <></>
            );

        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Last Will and Testament Generator</h1>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                i + 1 === currentStep
                  ? 'bg-blue-500 text-white'
                  : i + 1 < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 mt-2">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      <form onSubmit={handleGeneratePDF} className="space-y-8">
        {renderStep()}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Previous
            </button>
          )}
          {currentStep < totalSteps && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Next
            </button>
          )}
          {currentStep === totalSteps && (
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Generate Will
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WillGenerator;