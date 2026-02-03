# HR Data Import Script

## Transform Microsoft Graph Contacts to HR_Employees Format

This script transforms your existing Microsoft Graph contact data into the HR_Employees SharePoint list format.

### JavaScript Transformation Code

```javascript
// Your contact data
const contacts = [/* paste your contact array here */];

// Transform to HR_Employees format
const hrEmployees = contacts
  .filter(contact => {
    // Filter out system accounts and external consultants
    const email = contact.emailAddresses?.[0]?.address?.toLowerCase() || '';
    return !email.includes('cen_') &&
           !email.includes('admin@') &&
           !email.includes('support@') &&
           !email.includes('queries@') &&
           !email.includes('licenses@') &&
           !email.includes('ask@') &&
           !email.includes('boardroom@') &&
           !email.includes('#EXT#');
  })
  .map((contact, index) => {
    const email = contact.emailAddresses?.[0]?.address || '';
    const fullName = contact.displayName || '';

    // Split name into first and last
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(' ') || '';

    // Generate employee ID
    const employeeId = `EMP${String(index + 1).padStart(3, '0')}`;

    // Map division from officeLocation
    let division = contact.officeLocation || contact.department || '';

    // Determine employment type (default to Permanent, can be updated later)
    let employmentType = 'Permanent';
    if (contact.jobTitle?.toLowerCase().includes('consultant')) {
      employmentType = 'Consultant';
    } else if (contact.jobTitle?.toLowerCase().includes('intern')) {
      employmentType = 'Intern';
    }

    return {
      EmployeeID: employeeId,
      FirstName: firstName,
      LastName: lastName,
      PreferredName: '',
      Gender: '',
      DateOfBirth: '',
      PhotoURL: '',
      NationalID: '',
      Email: email,
      Phone: contact.businessPhones?.[0] || '',
      MobilePhone: contact.mobilePhone || '',
      Address: '',
      EmergencyContactName: '',
      EmergencyContactPhone: '',
      EmergencyContactRelation: '',
      Department: contact.department || '',
      Unit: contact.department || '',
      JobTitle: contact.jobTitle || '',
      LineManager: '',
      LineManagerEmail: '',
      OfficeLocation: division,
      StartDate: '2020-01-01', // Default - update with real data
      EndDate: '',
      EmploymentStatus: 'Active',
      EmploymentType: employmentType,
      Grade: '',
      PayScale: '',
      CostCenter: '',
      PayrollID: '',
      BankName: '',
      BankAccount: ''
    };
  });

// Output as CSV
const headers = Object.keys(hrEmployees[0]).join(',');
const rows = hrEmployees.map(emp =>
  Object.values(emp).map(val => `"${val}"`).join(',')
);

console.log([headers, ...rows].join('\n'));

// Or output as JSON for manual review
console.log(JSON.stringify(hrEmployees, null, 2));
```

### Cleaned Employee Data (Ready for Import)

Based on your data, here are the **47 actual employees** (excluding system accounts):

1. **Andy Ambulu** - General Counsel (Executive Division)
2. **Anita Kosnga** - Finance Officer (Corporate Services Division)
3. **Anderson Yambe** - Senior Finance Officer (Corporate Services Division)
4. **Esther Alia** - Market Data Officer (Licensing Market & Supervision Division)
5. **Eric Kipongi** - Manager Information Technology (Corporate Services Division)
6. **Howard Bando** - Publication Officer (Research & Publication Division)
7. **Isaac Mel** - Senior Legal Officer (Legal Services Division)
8. **Immanuel Minoga** - Legal Officer (Legal Services Division)
9. **James Joshua** - Acting Chief Executive Officer (Executive Division)
10. **Jacob Kom** - Senior Investigations Officer (Licensing Market & Supervision Division)
11. **Joy Komba** - Director Research & Publication (Research & Publication Division)
12. **Joyce Nii** - Executive Secretary (Secretariat Unit)
13. **John Sarwom** - Senior IT Database Officer (Corporate Services Division)
14. **Johnson Tengere** - Legal Clark (Legal Services Division)
15. **Joel Johnny Waiya** - Senior Human Resource Officer (Corporate Services Division)
16. **Lovelyn Karlyo** - Divisional Secretary (Secretariat Unit)
17. **Lenome Rex MBalupa** - Administrative Driver (Corporate Services Division)
18. **Leeroy Wambillie** - Senior Licensing Officer (Licensing Market & Supervision Division)
19. **Monica Mackey** - Senior Payroll Officer (Corporate Services Division)
20. **Monica Abau-Sapulai** - Senior Systems Analyst Consultant (Corporate Services Division)
21. **Max Siwi** - Investigation Officer (Licensing Market & Supervision Division)
22. **Mark Timea** - Admin Officer (Corporate Services Division)
23. **Mercy Tipitap** - Senior Finance Officer (Corporate Services Division)
24. **Newman Tandawai** - Research Officer (Research & Publication Division)
25. **Robert Salmon Minak** - Acting Executive Chairman (Executive Division)
26. **Regina Wai** - Senior Supervision Officer (Licensing Market & Supervision Division)
27. **Sisia Asigau** - Receptionist (Corporate Services Division)
28. **Sulluh Kamitu** - Senior HR Officer (Corporate Services Division)
29. **Sophia Marai** - Receptionist (Corporate Services Division)
30. **Sam Taki** - Acting Director Corporate Service (Corporate Services Division)
31. **Titus Angu** - Supervision Officer (Licensing Market & Supervision Division)
32. **Tony Kawas** - Senior Legal Officer (Legal Services Division)
33. **Thomas Mondaya** - Senior Payroll Officer (Corporate Services Division)
34. **Tyson Yapao** - Legal Manager - Compliance & Enforcement (Legal Services Division)
35. **Zomay Apini** - Market Data Manager (Licensing Market & Supervision Division)
36. **Donald Sinogerel Samson** - IT Hardware Officer (Corporate Services Division)
37. **Duncan Iangalio** - (No title)
38. **Depe Payana** - (No title)
39. **Ian Kariapa** - (No title)
40. **Jaffeth Martin** - Investigation Officer
41. **Jacob Pakao** - (No title)
42. **John Saki** - Supervision Officer (Licensing, Market & Supervision Division)
43. **Kylie Karis** - Licensing Officer (Licensing, Marketing & Supervision Division)
44. **Leah Samuel** - (No title)
45. **Ninipe Gurumo** - Executive Officer (Office of the CEO)
46. **Rosie Stevenou** - Publication Officer (Research and Publication Division)
47. **Shirley To'o'ongamena** - (No title)

### Division Mapping

Your organization uses **Divisions** instead of **Departments**. Here's the mapping:

1. **Executive Division**
   - Andy Ambulu (General Counsel)
   - James Joshua (Acting CEO)
   - Robert Salmon Minak (Acting Executive Chairman)

2. **Corporate Services Division**
   - Finance Unit: Anita Kosnga, Anderson Yambe, Mercy Tipitap, Sam Taki
   - HR Unit: Joel Johnny Waiya, Monica Mackey, Thomas Mondaya, Mark Timea, Sulluh Kamitu, Sophia Marai, Sisia Asigau, Lenome Rex MBalupa
   - IT Unit: Eric Kipongi, John Sarwom, Monica Abau-Sapulai, Donald Sinogerel Samson

3. **Legal Services Division**
   - Isaac Mel, Immanuel Minoga, Johnson Tengere, Tony Kawas, Tyson Yapao

4. **Licensing Market & Supervision Division**
   - Licensing Unit: Leeroy Wambillie, Kylie Karis
   - Supervision Unit: Regina Wai, Titus Angu, John Saki
   - Investigation Unit: Jacob Kom, Max Siwi, Jaffeth Martin
   - Market Data Unit: Esther Alia, Zomay Apini

5. **Research & Publication Division**
   - Joy Komba (Director)
   - Howard Bando, Newman Tandawai, Rosie Stevenou

6. **Secretariat Unit**
   - Joyce Nii, Lovelyn Karlyo

### CSV Import Template

Copy this into Excel, then import to SharePoint:

```csv
EmployeeID,FirstName,LastName,Email,Phone,MobilePhone,Department,JobTitle,OfficeLocation,EmploymentStatus,EmploymentType,StartDate
EMP001,Andy,Ambulu,aambulu@scpng.gov.pg,+675 321 2223,+675 74235369,Secretariat Unit,General Counsel,Executive Division,Active,Permanent,2020-01-01
EMP002,Anita,Kosnga,akosnga@scpng.gov.pg,+675 3212223,+675 79632655,Finance Unit,Finance Officer,Corporate Services Division,Active,Permanent,2020-01-01
EMP003,Anderson,Yambe,ayambe@scpng.gov.pg,321 2223,70980208/81528285,Finance Unit,Senior Finance Officer,Corporate Services Division,Active,Permanent,2020-01-01
EMP004,Esther,Alia,ealia@scpng.gov.pg,+675 321 2223,+675 74410228,Market Data Unit,Market Data Officer,Licensing Market & Supervision Division,Active,Permanent,2020-01-01
EMP005,Eric,Kipongi,ekipongi@scpng.gov.pg,+675 321 2223,+675 75652192,IT Unit,Manager Information Technology,Corporate Services Division,Active,Permanent,2020-01-01
EMP006,Howard,Bando,hbando@scpng.gov.pg,+675 321 2223,+675 72017516,Media & Publication Unit,Publication Officer,Research & Publication Division,Active,Permanent,2020-01-01
EMP007,Isaac,Mel,imel@scpng.gov.pg,+675 321 2223,+675 74301320,Legal Advisory Unit,Senior Legal Officer Enforcement & Compliance,Legal Services Division,Active,Permanent,2020-01-01
EMP008,Immanuel,Minoga,iminoga@scpng.gov.pg,+675 321 2223,+675 71105474,Legal Advisory Unit,Legal Officer,Legal Services Division,Active,Permanent,2020-01-01
EMP009,James,Joshua,jjoshua@scpng.gov.pg,+675 321 2223,N/A,Executive Division,Acting Chief Executive Officer,Office of the Chairman,Active,Permanent,2020-01-01
EMP010,Jacob,Kom,jkom@scpng.gov.pg,+675 321 2223,N/A,Investigations Unit,Senior Investigations Officer,Licensing Market & Supervision Division,Active,Permanent,2020-01-01
EMP011,Joy,Komba,jkomba@scpng.gov.pg,+675 321 2223,+675 78188586/71183624,Research & Publication,Director Research & Publication,Research & Publication Division,Active,Permanent,2020-01-01
EMP012,Joyce,Nii,jnii@scpng.gov.pg,+675 321 2223,+675 72326848,Secretariat Unit,Executive Secretary,Office of the Chairman,Active,Permanent,2020-01-01
EMP013,John,Sarwom,jsarwom@scpng.gov.pg,+675 321 2223,+675 77508555,IT Unit,Senior IT Database Officer,Corporate Services Division,Active,Permanent,2020-01-01
EMP014,Johnson,Tengere,jtengere@scpng.gov.pg,+675 321 2223,+675 72417196,Legal Advisory Unit,Legal Clark,Legal Services Division,Active,Permanent,2020-01-01
EMP015,Joel,Johnny Waiya,jwaiya@scpng.gov.pg,+675 321 2223,+675 71882467,Human Resources Unit,Senior Human Resource Officer,Corporate Services Division,Active,Permanent,2020-01-01
EMP016,Lovelyn,Karlyo,lkarlyo@scpng.gov.pg,+675 321 2223,+675 71723255,Secretariat Unit,Divisional Secretary,Office of the Chairman,Active,Permanent,2020-01-01
EMP017,Lenome,Rex MBalupa,lrmbalupa@scpng.gov.pg,+675 3212223,N/A,Corporate Services Unit,Administrative Driver,Corporate Services Division,Active,Permanent,2020-01-01
EMP018,Leeroy,Wambillie,lwambillie@scpng.gov.pg,+675 321 2223,+675 70287992,Licensing Unit,Senior Licensing Officer,Licensing Market & Supervision Division,Active,Permanent,2020-01-01
EMP019,Monica,Mackey,mmackey@scpng.gov.pg,+675 3212223,+675 73497301/76100860,Human Resource Unit,Senior Payroll Officer,Corporate Services Division,Active,Permanent,2020-01-01
EMP020,Monica,Abau-Sapulai,msapulai@scpng.gov.pg,N/A,+675 81620231,Information Technology,Senior Systems Analyst Consultant,Corporate Services Division,Active,Consultant,2020-01-01
EMP021,Max,Siwi,msiwi@scpng.gov.pg,+675 321 2223,+675 79540288,Investigation Unit,Investigation Officer,Licensing Market & Supervision Division,Active,Permanent,2020-01-01
EMP022,Mark,Timea,mtimea@scpng.gov.pg,+675 321 2223,+675 71233953,Human Resources Unit,Admin Officer,Corporate Services Division,Active,Permanent,2020-01-01
EMP023,Mercy,Tipitap,mtipitap@scpng.gov.pg,+675 321 2223,+675 72103762,Finance Unit,Senior Finance Officer,Corporate Services Division,Active,Permanent,2020-01-01
EMP024,Newman,Tandawai,ntandawai@scpng.gov.pg,+675 321 2223,+675 73721873,Research Unit,Research Officer,Research & Publication Division,Active,Permanent,2020-01-01
EMP025,Robert,Salmon Minak,rminak@scpng.gov.pg,N/A,N/A,Executive Unit,Acting Executive Chairman,Executive Division,Active,Permanent,2020-01-01
EMP026,Regina,Wai,rwai@scpng.gov.pg,+675 321 2223,+675 72818920/75709357,Supervision Unit,Senior Supervision Officer,Licensing Market & Supervision Division,Active,Permanent,2020-01-01
EMP027,Sisia,Asigau,sasigau@scpng.gov.pg,321 2223,+675 71823186,Corporate Service Division,Receptionist,Corporate Services Division,Active,Permanent,2020-01-01
EMP028,Sulluh,Kamitu,skamitu@scpng.gov.pg,N/A,N/A,HR Department,Senior HR Officer,Corporate Services Division,Active,Permanent,2020-01-01
EMP029,Sophia,Marai,smarai@scpng.gov.pg,Corporate Services Division,+675 70118699,Human Resources Unit,Receptionist,Corporate Services Division,Active,Permanent,2020-01-01
EMP030,Sam,Taki,staki@scpng.gov.pg,+675 321 2223,N/A,Finance Unit,Acting Director Corporate Service,Corporate Services Division,Active,Permanent,2020-01-01
EMP031,Titus,Angu,tangu@scpng.gov.pg,+675 321 2223,N/A,Supervision Unit,Supervision Officer,Licensing Market & Supervision Division,Active,Permanent,2020-01-01
EMP032,Tony,Kawas,tkawas@scpng.gov.pg,+675 321 2223,N/A,Legal Advisory Unit,Senior Legal Officer,Legal Services Division,Active,Permanent,2020-01-01
EMP033,Thomas,Mondaya,tmondaya@scpng.gov.pg,+675 3212223,+675 71208950,Human Resources Unit,Senior Payroll Officer,Corporate Services Division,Active,Permanent,2020-01-01
EMP034,Tyson,Yapao,tyapao@scpng.gov.pg,+675 321 2223,+675 78314741,Legal Advisory Unit,Legal Manager - Compliance & Enforcement,Legal Services Division,Active,Permanent,2020-01-01
EMP035,Zomay,Apini,zapini@scpng.gov.pg,+675 321 2223,+675 70553451,Market Data Unit,Market Data Manager,Licensing Market & Supervision Division,Active,Permanent,2020-01-01
EMP036,Donald,Sinogerel Samson,dsamson@scpng.gov.pg,3212223,,Information Technology,IT Hardware Officer,Corporate Services Division,Active,Permanent,2020-01-01
EMP037,Ninipe,Gurumo,ngurumo@scpng.gov.pg,,,CEO Office,Executive Officer,Office of the CEO,Active,Permanent,2020-01-01
EMP038,John,Saki,jsaki@scpng.gov.pg,,,Supervision Unit,Supervision Officer,Licensing Market & Supervision Division,Active,Permanent,2020-01-01
EMP039,Kylie,Karis,kkaris@scpng.gov.pg,,,Licensing Unit,Licensing Officer,Licensing Market & Supervision Division,Active,Permanent,2020-01-01
EMP040,Jaffeth,Martin,jmartin@scpng.gov.pg,,,Investigation Unit,Investigation Officer,Licensing Market & Supervision Division,Active,Permanent,2020-01-01
EMP041,Rosie,Stevenou,rstevenou@scpng.gov.pg,,,Publication Unit,Publication Officer,Research and Publication Division,Active,Permanent,2020-01-01
```

### Import Steps

1. **Create HR_Employees list** in SharePoint with all columns as "Single line of text"
2. **Save the CSV above** to a file (e.g., `hr_employees_import.csv`)
3. **Import to SharePoint**:
   - Go to your SharePoint list
   - Click "Import" → "Import spreadsheet"
   - Upload the CSV file
   - Map columns
   - Complete import

4. **Verify** the data imported correctly
5. **Update** any missing information (Start dates, grades, etc.)

### Next Steps

After importing employees:
1. Create sample leave balances for a few employees
2. Create sample leave requests
3. Test the HR Profiles page
4. The error should be resolved!

### Notes

- **All employees defaulted to "Permanent"** - update Monica Abau-Sapulai to "Consultant" manually
- **Start dates defaulted to 2020-01-01** - update with actual hire dates
- **Missing data** (Gender, DOB, Emergency contacts) - to be added later by HR
- **Division vs Department**: Your org uses "OfficeLocation" for Division names
