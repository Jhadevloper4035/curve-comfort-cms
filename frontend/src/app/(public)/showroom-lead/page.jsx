import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Col, Container, Row, Spinner } from 'react-bootstrap'
import ReactSelect from 'react-select'
import { apiFetch } from '@/helpers/httpClient'
import logoLight from '@/assets/images/logo-light-full.png'

const STATE_CITY_MAP = {
  'Andaman and Nicobar Islands (UT)': [
    'Port Blair',
    'Bambooflat',
    'Garacharma',
    'Wimberlygunj',
    'Hut Bay',
    'Neil Island',
    'Havelock Island',
    'Car Nicobar',
    'Campbell Bay',
    'Kondul',
    'Teressa',
    'Katchal',
    'Little Nicobar',
    'Great Nicobar',
    'Mayabunder',
    'Diglipur',
    'Rangat',
    'Billiground',
    'Pokadera',
  ],
  'Andhra Pradesh': [
    'Anantapur',
    'Chittoor',
    'East Godavari',
    'Guntur',
    'Krishna',
    'Kurnool',
    'Nellore',
    'Prakasam',
    'Srikakulam',
    'Visakhapatnam',
    'Vizianagaram',
    'West Godavari',
    'YSR Kadapa',
  ],
  'Arunachal Pradesh': [
    'Tawang',
    'West Kameng',
    'East Kameng',
    'Papum Pare',
    'Kurung Kumey',
    'Kra Daadi',
    'Lower Subansiri',
    'Upper Subansiri',
    'West Siang',
    'East Siang',
    'Siang',
    'Upper Siang',
    'Lower Siang',
    'Lower Dibang Valley',
    'Dibang Valley',
    'Anjaw',
    'Lohit',
    'Namsai',
    'Changlang',
    'Tirap',
    'Longding',
  ],
  Assam: [
    'Baksa',
    'Barpeta',
    'Biswanath',
    'Bongaigaon',
    'Cachar',
    'Charaideo',
    'Chirang',
    'Darrang',
    'Dhemaji',
    'Dhubri',
    'Dibrugarh',
    'Goalpara',
    'Golaghat',
    'Guwahati',
    'Hailakandi',
    'Hojai',
    'Jorhat',
    'Kamrup Metropolitan',
    'Kamrup',
    'Karbi Anglong',
    'Karimganj',
    'Kokrajhar',
    'Lakhimpur',
    'Majuli',
    'Morigaon',
    'Nagaon',
    'Nalbari',
    'Dima Hasao',
    'Sivasagar',
    'Sonitpur',
    'South Salmara-Mankachar',
    'Tinsukia',
    'Udalguri',
    'West Karbi Anglong',
  ],
  Bihar: [
    'Araria',
    'Arwal',
    'Aurangabad',
    'Banka',
    'Begusarai',
    'Bhagalpur',
    'Bhojpur',
    'Buxar',
    'Darbhanga',
    'East Champaran (Motihari)',
    'Gaya',
    'Gopalganj',
    'Jamui',
    'Jehanabad',
    'Kaimur (Bhabua)',
    'Katihar',
    'Khagaria',
    'Kishanganj',
    'Lakhisarai',
    'Madhepura',
    'Madhubani',
    'Munger (Monghyr)',
    'Muzaffarpur',
    'Nalanda',
    'Nawada',
    'Patna',
    'Purnia (Purnea)',
    'Rohtas',
    'Saharsa',
    'Samastipur',
    'Saran',
    'Sheikhpura',
    'Sheohar',
    'Sitamarhi',
    'Siwan',
    'Supaul',
    'Vaishali',
    'West Champaran',
  ],
  'Chandigarh (UT)': ['Chandigarh'],
  Chhattisgarh: [
    'Balod',
    'Baloda Bazar',
    'Balrampur',
    'Bastar',
    'Bemetara',
    'Bijapur',
    'Bilaspur',
    'Dantewada (South Bastar)',
    'Dhamtari',
    'Durg',
    'Gariyaband',
    'Janjgir-Champa',
    'Jashpur',
    'Kabirdham (Kawardha)',
    'Kanker (North Bastar)',
    'Kondagaon',
    'Korba',
    'Korea (Koriya)',
    'Mahasamund',
    'Mungeli',
    'Narayanpur',
    'Raigarh',
    'Raipur',
    'Rajnandgaon',
    'Sukma',
    'Surajpur',
    'Surguja',
  ],
  'Dadra and Nagar Haveli (UT)': ['Dadra & Nagar Haveli'],
  'Daman and Diu (UT)': ['Daman', 'Diu'],
  'Delhi (NCT)': [
    'Central Delhi',
    'East Delhi',
    'New Delhi',
    'North Delhi',
    'North East Delhi',
    'North West Delhi',
    'Shahdara',
    'South Delhi',
    'South East Delhi',
    'South West Delhi',
    'West Delhi',
  ],
  Goa: ['North Goa', 'South Goa'],
  Gujarat: [
    'Ahmedabad',
    'Amreli',
    'Anand',
    'Aravalli',
    'Banaskantha (Palanpur)',
    'Bharuch',
    'Bhavnagar',
    'Botad',
    'Chhota Udepur',
    'Dahod',
    'Dangs (Ahwa)',
    'Devbhoomi Dwarka',
    'Gandhinagar',
    'Gir Somnath',
    'Jamnagar',
    'Junagadh',
    'Kachchh',
    'Kheda (Nadiad)',
    'Mahisagar',
    'Mehsana',
    'Morbi',
    'Narmada (Rajpipla)',
    'Navsari',
    'Panchmahal (Godhra)',
    'Patan',
    'Porbandar',
    'Rajkot',
    'Sabarkantha (Himmatnagar)',
    'Surat',
    'Surendranagar',
    'Tapi (Vyara)',
    'Vadodara',
    'Valsad',
  ],
  Haryana: [
    'Ambala',
    'Bhiwani',
    'Charkhi Dadri',
    'Faridabad',
    'Fatehabad',
    'Gurgaon',
    'Hisar',
    'Jhajjar',
    'Jind',
    'Kaithal',
    'Karnal',
    'Kurukshetra',
    'Mahendragarh',
    'Mewat',
    'Palwal',
    'Panchkula',
    'Panipat',
    'Rewari',
    'Rohtak',
    'Sirsa',
    'Sonipat',
    'Yamunanagar',
  ],
  'Himachal Pradesh': [
    'Bilaspur',
    'Chamba',
    'Hamirpur',
    'Kangra',
    'Kinnaur',
    'Kullu',
    'Lahaul & Spiti',
    'Mandi',
    'Shimla',
    'Sirmaur (Sirmour)',
    'Solan',
    'Una',
  ],
  'Jammu and Kashmir': [
    'Anantnag',
    'Bandipore',
    'Baramulla',
    'Budgam',
    'Doda',
    'Ganderbal',
    'Jammu',
    'Kargil',
    'Kathua',
    'Kishtwar',
    'Kulgam',
    'Kupwara',
    'Leh',
    'Poonch',
    'Pulwama',
    'Rajouri',
    'Ramban',
    'Reasi',
    'Samba',
    'Shopian',
    'Srinagar',
    'Udhampur',
  ],
  Jharkhand: [
    'Bokaro',
    'Chatra',
    'Deoghar',
    'Dhanbad',
    'Dumka',
    'East Singhbhum',
    'Garhwa',
    'Giridih',
    'Godda',
    'Gumla',
    'Hazaribag',
    'Jamtara',
    'Khunti',
    'Koderma',
    'Latehar',
    'Lohardaga',
    'Pakur',
    'Palamu',
    'Ramgarh',
    'Ranchi',
    'Sahibganj',
    'Seraikela-Kharsawan',
    'Simdega',
    'West Singhbhum',
    'Jamshedpur',
  ],
  Karnataka: [
    'Bagalkot',
    'Ballari (Bellary)',
    'Belagavi (Belgaum)',
    'Bengaluru (Bangalore) Rural',
    'Bengaluru (Bangalore) Urban',
    'Bidar',
    'Chamarajanagar',
    'Chikballapur',
    'Chikkamagaluru (Chikmagalur)',
    'Chitradurga',
    'Dakshina Kannada',
    'Davangere',
    'Dharwad',
    'Gadag',
    'Hassan',
    'Haveri',
    'Kalaburagi (Gulbarga)',
    'Kodagu',
    'Kolar',
    'Koppal',
    'Mandya',
    'Mysuru (Mysore)',
    'Raichur',
    'Ramanagara',
    'Shivamogga (Shimoga)',
    'Tumakuru (Tumkur)',
    'Udupi',
    'Uttara Kannada (Karwar)',
    'Vijayapura (Bijapur)',
    'Yadgir',
  ],
  Kerala: [
    'Alappuzha',
    'Ernakulam',
    'Idukki',
    'Kannur',
    'Kasaragod',
    'Kollam',
    'Kottayam',
    'Kozhikode',
    'Malappuram',
    'Palakkad',
    'Pathanamthitta',
    'Thiruvananthapuram',
    'Thrissur',
    'Wayanad',
  ],
  'Lakshadweep (UT)': ['Agatti', 'Amini', 'Androth', 'Bithra', 'Chethlath', 'Kavaratti', 'Kadmath', 'Kalpeni', 'Kilthan', 'Minicoy'],
  'Madhya Pradesh': [
    'Agar Malwa',
    'Alirajpur',
    'Anuppur',
    'Ashoknagar',
    'Balaghat',
    'Barwani',
    'Betul',
    'Bhind',
    'Bhopal',
    'Burhanpur',
    'Chhatarpur',
    'Chhindwara',
    'Damoh',
    'Datia',
    'Dewas',
    'Dhar',
    'Dindori',
    'Guna',
    'Gwalior',
    'Harda',
    'Hoshangabad',
    'Indore',
    'Jabalpur',
    'Jhabua',
    'Katni',
    'Khandwa',
    'Khargone',
    'Mandla',
    'Mandsaur',
    'Morena',
    'Narsinghpur',
    'Neemuch',
    'Panna',
    'Raisen',
    'Rajgarh',
    'Ratlam',
    'Rewa',
    'Sagar',
    'Satna',
    'Sehore',
    'Seoni',
    'Shahdol',
    'Shajapur',
    'Sheopur',
    'Shivpuri',
    'Sidhi',
    'Singrauli',
    'Tikamgarh',
    'Ujjain',
    'Umaria',
    'Vidisha',
  ],
  Maharashtra: [
    'Ahmednagar',
    'Akola',
    'Amravati',
    'Aurangabad',
    'Beed',
    'Bhandara',
    'Buldhana',
    'Chandrapur',
    'Dhule',
    'Gadchiroli',
    'Gondia',
    'Hingoli',
    'Jalgaon',
    'Jalna',
    'Kolhapur',
    'Latur',
    'Mumbai City',
    'Mumbai Suburban',
    'Nagpur',
    'Nanded',
    'Nandurbar',
    'Nashik',
    'Osmanabad',
    'Palghar',
    'Parbhani',
    'Pune',
    'Raigad',
    'Ratnagiri',
    'Sangli',
    'Satara',
    'Sindhudurg',
    'Solapur',
    'Thane',
    'Wardha',
    'Washim',
    'Yavatmal',
  ],
  Manipur: [
    'Bishnupur',
    'Chandel',
    'Churachandpur',
    'Imphal East',
    'Imphal West',
    'Jiribam',
    'Kakching',
    'Kamjong',
    'Kangpokpi',
    'Noney',
    'Pherzawl',
    'Senapati',
    'Tamenglong',
    'Tengnoupal',
    'Thoubal',
    'Ukhrul',
  ],
  Meghalaya: [
    'East Garo Hills',
    'East Jaintia Hills',
    'East Khasi Hills',
    'North Garo Hills',
    'Ri Bhoi',
    'South Garo Hills',
    'South West Garo Hills',
    'South West Khasi Hills',
    'West Garo Hills',
    'West Jaintia Hills',
    'West Khasi Hills',
  ],
  Mizoram: ['Aizawl', 'Champhai', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Serchhip'],
  Nagaland: ['Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'],
  Odisha: [
    'Angul',
    'Balangir',
    'Balasore',
    'Bargarh',
    'Bhadrak',
    'Boudh',
    'Cuttack',
    'Deogarh',
    'Dhenkanal',
    'Gajapati',
    'Ganjam',
    'Jagatsinghapur',
    'Jajpur',
    'Jharsuguda',
    'Kalahandi',
    'Kandhamal',
    'Kendrapara',
    'Kendujhar (Keonjhar)',
    'Khordha',
    'Koraput',
    'Malkangiri',
    'Mayurbhanj',
    'Nabarangpur',
    'Nayagarh',
    'Nuapada',
    'Puri',
    'Rayagada',
    'Sambalpur',
    'Sonepur',
    'Sundargarh',
  ],
  'Puducherry (UT)': ['Karaikal', 'Mahe', 'Pondicherry', 'Yanam'],
  Punjab: [
    'Amritsar',
    'Barnala',
    'Bathinda',
    'Faridkot',
    'Fatehgarh Sahib',
    'Fazilka',
    'Ferozepur',
    'Gurdaspur',
    'Hoshiarpur',
    'Jalandhar',
    'Kapurthala',
    'Ludhiana',
    'Mansa',
    'Moga',
    'Muktsar',
    'Nawanshahr (Shahid Bhagat Singh Nagar)',
    'Pathankot',
    'Patiala',
    'Rupnagar',
    'Sahibzada Ajit Singh Nagar (Mohali)',
    'Sangrur',
    'Tarn Taran',
  ],
  Rajasthan: [
    'Ajmer',
    'Alwar',
    'Banswara',
    'Baran',
    'Barmer',
    'Bharatpur',
    'Bhilwara',
    'Bikaner',
    'Bundi',
    'Chittorgarh',
    'Churu',
    'Dausa',
    'Dholpur',
    'Dungarpur',
    'Hanumangarh',
    'Jaipur',
    'Jaisalmer',
    'Jalore',
    'Jhalawar',
    'Jhunjhunu',
    'Jodhpur',
    'Karauli',
    'Kota',
    'Nagaur',
    'Pali',
    'Pratapgarh',
    'Rajsamand',
    'Sawai Madhopur',
    'Sikar',
    'Sirohi',
    'Sri Ganganagar',
    'Tonk',
    'Udaipur',
  ],
  Sikkim: ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim'],
  'Tamil Nadu': [
    'Ariyalur',
    'Chennai',
    'Coimbatore',
    'Cuddalore',
    'Dharmapuri',
    'Dindigul',
    'Erode',
    'Kanchipuram',
    'Kanyakumari',
    'Karur',
    'Krishnagiri',
    'Madurai',
    'Nagapattinam',
    'Namakkal',
    'Nilgiris',
    'Perambalur',
    'Pudukkottai',
    'Ramanathapuram',
    'Salem',
    'Sivaganga',
    'Thanjavur',
    'Theni',
    'Thoothukudi (Tuticorin)',
    'Tiruchirappalli',
    'Tirunelveli',
    'Tiruppur',
    'Tiruvallur',
    'Tiruvannamalai',
    'Tiruvarur',
    'Vellore',
    'Viluppuram',
    'Virudhunagar',
  ],
  Telangana: [
    'Adilabad',
    'Bhadradri Kothagudem',
    'Hyderabad',
    'Jagtial',
    'Jangaon',
    'Jayashankar Bhoopalpally',
    'Jogulamba Gadwal',
    'Kamareddy',
    'Karimnagar',
    'Khammam',
    'Komaram Bheem Asifabad',
    'Mahabubabad',
    'Mahabubnagar',
    'Mancherial',
    'Medak',
    'Medchal',
    'Nagarkurnool',
    'Nalgonda',
    'Nirmal',
    'Nizamabad',
    'Peddapalli',
    'Rajanna Sircilla',
    'Rangareddy',
    'Sangareddy',
    'Siddipet',
    'Suryapet',
    'Vikarabad',
    'Wanaparthy',
    'Warangal (Rural)',
    'Warangal (Urban)',
    'Yadadri Bhuvanagiri',
  ],
  Tripura: ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
  Uttarakhand: [
    'Almora',
    'Bageshwar',
    'Chamoli',
    'Champawat',
    'Dehradun',
    'Haridwar',
    'Nainital',
    'Pauri Garhwal',
    'Pithoragarh',
    'Rudraprayag',
    'Tehri Garhwal',
    'Udham Singh Nagar',
    'Uttarkashi',
  ],
  'Uttar Pradesh': [
    'Agra',
    'Aligarh',
    'Allahabad',
    'Ambedkar Nagar',
    'Amethi (Chatrapati Sahuji Mahraj Nagar)',
    'Amroha (J.P. Nagar)',
    'Auraiya',
    'Azamgarh',
    'Baghpat',
    'Bahraich',
    'Ballia',
    'Balrampur',
    'Banda',
    'Barabanki',
    'Bareilly',
    'Basti',
    'Bhadohi',
    'Bijnor',
    'Budaun',
    'Bulandshahr',
    'Chandauli',
    'Chitrakoot',
    'Deoria',
    'Etah',
    'Etawah',
    'Faizabad',
    'Farrukhabad',
    'Fatehpur',
    'Firozabad',
    'Gautam Buddha Nagar',
    'Ghaziabad',
    'Ghazipur',
    'Gonda',
    'Gorakhpur',
    'Hamirpur',
    'Hapur (Panchsheel Nagar)',
    'Hardoi',
    'Hathras',
    'Jalaun',
    'Jaunpur',
    'Jhansi',
    'Kannauj',
    'Kanpur Dehat',
    'Kanpur Nagar',
    'Kanshiram Nagar (Kasganj)',
    'Kaushambi',
    'Kushinagar (Padrauna)',
    'Lakhimpur - Kheri',
    'Lalitpur',
    'Lucknow',
    'Maharajganj',
    'Mahoba',
    'Mainpuri',
    'Mathura',
    'Mau',
    'Meerut',
    'Mirzapur',
    'Moradabad',
    'Muzaffarnagar',
    'Pilibhit',
    'Pratapgarh',
    'RaeBareli',
    'Rampur',
    'Saharanpur',
    'Sambhal (Bhim Nagar)',
    'Sant Kabir Nagar',
    'Shahjahanpur',
    'Shamali (Prabuddh Nagar)',
    'Shravasti',
    'Siddharth Nagar',
    'Sitapur',
    'Sonbhadra',
    'Sultanpur',
    'Unnao',
    'Varanasi',
  ],
  'West Bengal': [
    'Alipurduar',
    'Bankura',
    'Birbhum',
    'Burdwan (Bardhaman)',
    'Cooch Behar',
    'Dakshin Dinajpur (South Dinajpur)',
    'Darjeeling',
    'Hooghly',
    'Howrah',
    'Jalpaiguri',
    'Kalimpong',
    'Kolkata',
    'Malda',
    'Murshidabad',
    'Nadia',
    'North 24 Parganas',
    'Paschim Medinipur (West Medinipur)',
    'Purba Medinipur (East Medinipur)',
    'Purulia',
    'South 24 Parganas',
    'Uttar Dinajpur (North Dinajpur)',
  ],
}

const PRODUCT_OPTIONS = [
  { value: '1mm+ Laminates', label: '1mm+ Laminates' },
  { value: '0.8mm Laminates', label: '0.8mm Laminates' },
  { value: 'FR Flexi Laminates', label: 'FR Flexi Laminates' },
  { value: 'Acrylish Laminates', label: 'Acrylish Laminates' },
  { value: 'Soffitto', label: 'Soffitto' },
  { value: 'MDF', label: 'MDF' },
  { value: 'Skybond', label: 'Skybond' },
]

const USER_TYPE_OPTIONS = ['Architect/Interior designer', 'Dealer', 'Distributor', 'OEM', 'Contractor', 'End Customer'].map((t) => ({
  value: t,
  label: t,
}))

const STATE_OPTIONS = Object.keys(STATE_CITY_MAP).map((s) => ({ value: s, label: s }))

const INITIAL = {
  fullName: '',
  email: '',
  mobileNumber: '',
  userType: '',
  productType: [],
  companyName: '',
  state: '',
  city: '',
  representative: '',
}

// Shared dark-theme styles for every ReactSelect on this page
const darkSelect = {
  control: (b, s) => ({
    ...b,
    backgroundColor: '#2b2b2b',
    borderColor: s.isFocused ? '#6c757d' : '#444',
    boxShadow: s.isFocused ? '0 0 0 0.2rem rgba(108,117,125,.25)' : 'none',
    '&:hover': { borderColor: '#6c757d' },
  }),
  menu: (b) => ({ ...b, backgroundColor: '#2b2b2b', zIndex: 9999 }),
  menuList: (b) => ({ ...b, backgroundColor: '#2b2b2b' }),
  option: (b, s) => ({
    ...b,
    backgroundColor: s.isFocused ? '#3d3d3d' : s.isSelected ? '#495057' : 'transparent',
    color: '#dee2e6',
    '&:active': { backgroundColor: '#495057' },
  }),
  singleValue: (b) => ({ ...b, color: '#dee2e6' }),
  multiValue: (b) => ({ ...b, backgroundColor: '#495057' }),
  multiValueLabel: (b) => ({ ...b, color: '#dee2e6' }),
  multiValueRemove: (b) => ({ ...b, color: '#adb5bd', '&:hover': { backgroundColor: '#dc3545', color: '#fff' } }),
  placeholder: (b) => ({ ...b, color: '#6c757d' }),
  input: (b) => ({ ...b, color: '#dee2e6' }),
  indicatorSeparator: (b) => ({ ...b, backgroundColor: '#444' }),
  dropdownIndicator: (b) => ({ ...b, color: '#6c757d' }),
  clearIndicator: (b) => ({ ...b, color: '#6c757d' }),
  noOptionsMessage: (b) => ({ ...b, color: '#6c757d', backgroundColor: '#2b2b2b' }),
}

const inputStyle = {
  backgroundColor: '#2b2b2b',
  border: '1px solid #444',
  color: '#dee2e6',
  borderRadius: 4,
  padding: '8px 12px',
  width: '100%',
  outline: 'none',
  fontSize: 14,
}

const labelStyle = { color: '#dee2e6', fontSize: 14, marginBottom: 6, display: 'block' }

const ShowroomLeadForm = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const cityOptions = form.state ? (STATE_CITY_MAP[form.state] ?? []).map((c) => ({ value: c, label: c })) : []

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value, ...(name === 'state' ? { city: '' } : {}) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.productType.length) {
      setError('Please select at least one product.')
      return
    }
    setSubmitting(true)
    try {
      await apiFetch('/api/lead/showroom/contact-form-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      navigate('/thank-you', {
        state: {
          message: 'Your showroom enquiry has been submitted successfully. Our team will get in touch with you shortly.',
          backPath: '/showroom-lead',
          backLabel: 'Submit Another Enquiry',
        },
      })
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          "url(\"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20xmlns:svgjs='http://svgjs.dev/svgjs'%20width='1920'%20height='1050'%20preserveAspectRatio='none'%20viewBox='0%200%201920%201050'%3e%3cg%20mask='url(%23SvgjsMask1032)'%20fill='none'%3e%3cpath%20d='M0%200L773.71%200L0%20429.38z'%20fill='rgba(255,%20255,%20255,%20.1)'%3e%3c/path%3e%3cpath%20d='M0%20429.38L773.71%200L890.1400000000001%200L0%20604.44z'%20fill='rgba(255,%20255,%20255,%20.075)'%3e%3c/path%3e%3cpath%20d='M0%20604.44L890.1400000000001%200L1014.45%200L0%20857.6300000000001z'%20fill='rgba(255,%20255,%20255,%20.05)'%3e%3c/path%3e%3cpath%20d='M0%20857.6300000000001L1014.45%200L1152.65%200L0%20977.1200000000001z'%20fill='rgba(255,%20255,%20255,%20.025)'%3e%3c/path%3e%3cpath%20d='M1920%201050L1453.1%201050L1920%20616.74z'%20fill='rgba(0,%200,%200,%20.1)'%3e%3c/path%3e%3cpath%20d='M1920%20616.74L1453.1%201050L908.2799999999999%201050L1920%20522.16z'%20fill='rgba(0,%200,%200,%20.075)'%3e%3c/path%3e%3cpath%20d='M1920%20522.16L908.28%201050L485.4%201050L1920%20198.98999999999995z'%20fill='rgba(0,%200,%200,%20.05)'%3e%3c/path%3e%3cpath%20d='M1920%20198.99L485.4000000000001%201050L420.55000000000007%201050L1920%2074.84z'%20fill='rgba(0,%200,%200,%20.025)'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask%20id='SvgjsMask1032'%3e%3crect%20width='1920'%20height='1050'%20fill='%23ffffff'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e\") #282f36",
        paddingBottom: 0,
      }}>
      {/* navbar */}
      <nav style={{ backgroundColor: '#282f36', borderBottom: '1px solid #444', padding: '12px 0' }}>
        <Container className="d-flex justify-content-center">
          <img src={logoLight} alt="Curve Comfort" style={{ height: 55 }} />
        </Container>
      </nav>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={6} xl={6}>
            <div style={{ backgroundColor: '#282f36', borderRadius: 12, padding: '36px 40px' }}>
              <h2 style={{ color: '#fff', textAlign: 'center', fontWeight: 400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 40 }}>
                Showroom Visit
              </h2>

              {error && (
                <div
                  style={{
                    backgroundColor: '#4a1a1a',
                    border: '1px solid #dc3545',
                    color: '#f8d7da',
                    borderRadius: 6,
                    padding: '10px 14px',
                    marginBottom: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <span>{error}</span>
                  <button
                    onClick={() => setError('')}
                    style={{ background: 'none', border: 'none', color: '#f8d7da', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
                    ×
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>
                        Full Name <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        style={inputStyle}
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>
                        Mobile Number <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        style={inputStyle}
                        name="mobileNumber"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Email</label>
                      <input
                        style={inputStyle}
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email address (optional)"
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>
                        User Type <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <ReactSelect
                        options={USER_TYPE_OPTIONS}
                        styles={darkSelect}
                        placeholder="Select user type..."
                        classNamePrefix="react-select"
                        onChange={(opt) => setForm((prev) => ({ ...prev, userType: opt?.value ?? '' }))}
                        value={USER_TYPE_OPTIONS.find((o) => o.value === form.userType) ?? null}
                      />
                    </div>
                  </Col>
                </Row>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>
                    Product Enquiry <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <ReactSelect
                    isMulti
                    options={PRODUCT_OPTIONS}
                    styles={darkSelect}
                    placeholder="Select products..."
                    classNamePrefix="react-select"
                    onChange={(opts) => setForm((prev) => ({ ...prev, productType: opts ? opts.map((o) => o.value) : [] }))}
                    value={PRODUCT_OPTIONS.filter((o) => form.productType.includes(o.value))}
                  />
                  {form.productType.length === 0 && <div style={{ color: '#6c757d', fontSize: 12, marginTop: 4 }}>Select at least one product</div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>
                    Firm Name &amp; Address <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    style={inputStyle}
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Enter your firm name and address"
                    required
                  />
                </div>

                <Row>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>
                        State <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <ReactSelect
                        options={STATE_OPTIONS}
                        styles={darkSelect}
                        placeholder="Select state..."
                        classNamePrefix="react-select"
                        onChange={(opt) => setForm((prev) => ({ ...prev, state: opt?.value ?? '', city: '' }))}
                        value={STATE_OPTIONS.find((o) => o.value === form.state) ?? null}
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>
                        City <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <ReactSelect
                        options={cityOptions}
                        styles={darkSelect}
                        placeholder={form.state ? 'Select city...' : 'Select state first'}
                        classNamePrefix="react-select"
                        isDisabled={!form.state}
                        onChange={(opt) => setForm((prev) => ({ ...prev, city: opt?.value ?? '' }))}
                        value={cityOptions.find((o) => o.value === form.city) ?? null}
                      />
                    </div>
                  </Col>
                </Row>

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>
                    Representative <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    style={inputStyle}
                    name="representative"
                    value={form.representative}
                    onChange={handleChange}
                    placeholder="Representative name"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0d6efd',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}>
                  {submitting ? (
                    <>
                      <Spinner size="sm" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Enquiry'
                  )}
                </button>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ShowroomLeadForm
