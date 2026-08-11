import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import ReactSelect from 'react-select'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import TextFormInput from '@/components/form/TextFormInput'
import SelectFormInput from '@/components/form/SelectFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { apiFetch } from '@/helpers/httpClient'

const STATE_CITY_MAP = {
  "Andaman and Nicobar Islands (UT)": ["Port Blair","Bambooflat","Garacharma","Wimberlygunj","Hut Bay","Neil Island","Havelock Island","Car Nicobar","Campbell Bay","Kondul","Teressa","Katchal","Little Nicobar","Great Nicobar","Mayabunder","Diglipur","Rangat","Billiground","Pokadera"],
  "Andhra Pradesh": ["Anantapur","Chittoor","East Godavari","Guntur","Krishna","Kurnool","Nellore","Prakasam","Srikakulam","Visakhapatnam","Vizianagaram","West Godavari","YSR Kadapa"],
  "Arunachal Pradesh": ["Tawang","West Kameng","East Kameng","Papum Pare","Kurung Kumey","Kra Daadi","Lower Subansiri","Upper Subansiri","West Siang","East Siang","Siang","Upper Siang","Lower Siang","Lower Dibang Valley","Dibang Valley","Anjaw","Lohit","Namsai","Changlang","Tirap","Longding"],
  "Assam": ["Baksa","Barpeta","Biswanath","Bongaigaon","Cachar","Charaideo","Chirang","Darrang","Dhemaji","Dhubri","Dibrugarh","Goalpara","Golaghat","Guwahati","Hailakandi","Hojai","Jorhat","Kamrup Metropolitan","Kamrup","Karbi Anglong","Karimganj","Kokrajhar","Lakhimpur","Majuli","Morigaon","Nagaon","Nalbari","Dima Hasao","Sivasagar","Sonitpur","South Salmara-Mankachar","Tinsukia","Udalguri","West Karbi Anglong"],
  "Bihar": ["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","East Champaran (Motihari)","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur (Bhabua)","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger (Monghyr)","Muzaffarpur","Nalanda","Nawada","Patna","Purnia (Purnea)","Rohtas","Saharsa","Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali","West Champaran"],
  "Chandigarh (UT)": ["Chandigarh"],
  "Chhattisgarh": ["Balod","Baloda Bazar","Balrampur","Bastar","Bemetara","Bijapur","Bilaspur","Dantewada (South Bastar)","Dhamtari","Durg","Gariyaband","Janjgir-Champa","Jashpur","Kabirdham (Kawardha)","Kanker (North Bastar)","Kondagaon","Korba","Korea (Koriya)","Mahasamund","Mungeli","Narayanpur","Raigarh","Raipur","Rajnandgaon","Sukma","Surajpur","Surguja"],
  "Dadra and Nagar Haveli (UT)": ["Dadra & Nagar Haveli"],
  "Daman and Diu (UT)": ["Daman","Diu"],
  "Delhi (NCT)": ["Central Delhi","East Delhi","New Delhi","North Delhi","North East Delhi","North West Delhi","Shahdara","South Delhi","South East Delhi","South West Delhi","West Delhi"],
  "Goa": ["North Goa","South Goa"],
  "Gujarat": ["Ahmedabad","Amreli","Anand","Aravalli","Banaskantha (Palanpur)","Bharuch","Bhavnagar","Botad","Chhota Udepur","Dahod","Dangs (Ahwa)","Devbhoomi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kachchh","Kheda (Nadiad)","Mahisagar","Mehsana","Morbi","Narmada (Rajpipla)","Navsari","Panchmahal (Godhra)","Patan","Porbandar","Rajkot","Sabarkantha (Himmatnagar)","Surat","Surendranagar","Tapi (Vyara)","Vadodara","Valsad"],
  "Haryana": ["Ambala","Bhiwani","Charkhi Dadri","Faridabad","Fatehabad","Gurgaon","Hisar","Jhajjar","Jind","Kaithal","Karnal","Kurukshetra","Mahendragarh","Mewat","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul & Spiti","Mandi","Shimla","Sirmaur (Sirmour)","Solan","Una"],
  "Jammu and Kashmir": ["Anantnag","Bandipore","Baramulla","Budgam","Doda","Ganderbal","Jammu","Kargil","Kathua","Kishtwar","Kulgam","Kupwara","Leh","Poonch","Pulwama","Rajouri","Ramban","Reasi","Samba","Shopian","Srinagar","Udhampur"],
  "Jharkhand": ["Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum","Garhwa","Giridih","Godda","Gumla","Hazaribag","Jamtara","Khunti","Koderma","Latehar","Lohardaga","Pakur","Palamu","Ramgarh","Ranchi","Sahibganj","Seraikela-Kharsawan","Simdega","West Singhbhum","Jamshedpur"],
  "Karnataka": ["Bagalkot","Ballari (Bellary)","Belagavi (Belgaum)","Bengaluru (Bangalore) Rural","Bengaluru (Bangalore) Urban","Bidar","Chamarajanagar","Chikballapur","Chikkamagaluru (Chikmagalur)","Chitradurga","Dakshina Kannada","Davangere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi (Gulbarga)","Kodagu","Kolar","Koppal","Mandya","Mysuru (Mysore)","Raichur","Ramanagara","Shivamogga (Shimoga)","Tumakuru (Tumkur)","Udupi","Uttara Kannada (Karwar)","Vijayapura (Bijapur)","Yadgir"],
  "Kerala": ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
  "Lakshadweep (UT)": ["Agatti","Amini","Androth","Bithra","Chethlath","Kavaratti","Kadmath","Kalpeni","Kilthan","Minicoy"],
  "Madhya Pradesh": ["Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas","Dhar","Dindori","Guna","Gwalior","Harda","Hoshangabad","Indore","Jabalpur","Jhabua","Katni","Khandwa","Khargone","Mandla","Mandsaur","Morena","Narsinghpur","Neemuch","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain","Umaria","Vidisha"],
  "Maharashtra": ["Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
  "Manipur": ["Bishnupur","Chandel","Churachandpur","Imphal East","Imphal West","Jiribam","Kakching","Kamjong","Kangpokpi","Noney","Pherzawl","Senapati","Tamenglong","Tengnoupal","Thoubal","Ukhrul"],
  "Meghalaya": ["East Garo Hills","East Jaintia Hills","East Khasi Hills","North Garo Hills","Ri Bhoi","South Garo Hills","South West Garo Hills","South West Khasi Hills","West Garo Hills","West Jaintia Hills","West Khasi Hills"],
  "Mizoram": ["Aizawl","Champhai","Kolasib","Lawngtlai","Lunglei","Mamit","Saiha","Serchhip"],
  "Nagaland": ["Dimapur","Kiphire","Kohima","Longleng","Mokokchung","Mon","Peren","Phek","Tuensang","Wokha","Zunheboto"],
  "Odisha": ["Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh","Dhenkanal","Gajapati","Ganjam","Jagatsinghapur","Jajpur","Jharsuguda","Kalahandi","Kandhamal","Kendrapara","Kendujhar (Keonjhar)","Khordha","Koraput","Malkangiri","Mayurbhanj","Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Sonepur","Sundargarh"],
  "Puducherry (UT)": ["Karaikal","Mahe","Pondicherry","Yanam"],
  "Punjab": ["Amritsar","Barnala","Bathinda","Faridkot","Fatehgarh Sahib","Fazilka","Ferozepur","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Mansa","Moga","Muktsar","Nawanshahr (Shahid Bhagat Singh Nagar)","Pathankot","Patiala","Rupnagar","Sahibzada Ajit Singh Nagar (Mohali)","Sangrur","Tarn Taran"],
  "Rajasthan": ["Ajmer","Alwar","Banswara","Baran","Barmer","Bharatpur","Bhilwara","Bikaner","Bundi","Chittorgarh","Churu","Dausa","Dholpur","Dungarpur","Hanumangarh","Jaipur","Jaisalmer","Jalore","Jhalawar","Jhunjhunu","Jodhpur","Karauli","Kota","Nagaur","Pali","Pratapgarh","Rajsamand","Sawai Madhopur","Sikar","Sirohi","Sri Ganganagar","Tonk","Udaipur"],
  "Sikkim": ["East Sikkim","North Sikkim","South Sikkim","West Sikkim"],
  "Tamil Nadu": ["Ariyalur","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kanchipuram","Kanyakumari","Karur","Krishnagiri","Madurai","Nagapattinam","Namakkal","Nilgiris","Perambalur","Pudukkottai","Ramanathapuram","Salem","Sivaganga","Thanjavur","Theni","Thoothukudi (Tuticorin)","Tiruchirappalli","Tirunelveli","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur","Vellore","Viluppuram","Virudhunagar"],
  "Telangana": ["Adilabad","Bhadradri Kothagudem","Hyderabad","Jagtial","Jangaon","Jayashankar Bhoopalpally","Jogulamba Gadwal","Kamareddy","Karimnagar","Khammam","Komaram Bheem Asifabad","Mahabubabad","Mahabubnagar","Mancherial","Medak","Medchal","Nagarkurnool","Nalgonda","Nirmal","Nizamabad","Peddapalli","Rajanna Sircilla","Rangareddy","Sangareddy","Siddipet","Suryapet","Vikarabad","Wanaparthy","Warangal (Rural)","Warangal (Urban)","Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai","Gomati","Khowai","North Tripura","Sepahijala","South Tripura","Unakoti","West Tripura"],
  "Uttarakhand": ["Almora","Bageshwar","Chamoli","Champawat","Dehradun","Haridwar","Nainital","Pauri Garhwal","Pithoragarh","Rudraprayag","Tehri Garhwal","Udham Singh Nagar","Uttarkashi"],
  "Uttar Pradesh": ["Agra","Aligarh","Allahabad","Ambedkar Nagar","Amethi (Chatrapati Sahuji Mahraj Nagar)","Amroha (J.P. Nagar)","Auraiya","Azamgarh","Baghpat","Bahraich","Ballia","Balrampur","Banda","Barabanki","Bareilly","Basti","Bhadohi","Bijnor","Budaun","Bulandshahr","Chandauli","Chitrakoot","Deoria","Etah","Etawah","Faizabad","Farrukhabad","Fatehpur","Firozabad","Gautam Buddha Nagar","Ghaziabad","Ghazipur","Gonda","Gorakhpur","Hamirpur","Hapur (Panchsheel Nagar)","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi","Kannauj","Kanpur Dehat","Kanpur Nagar","Kanshiram Nagar (Kasganj)","Kaushambi","Kushinagar (Padrauna)","Lakhimpur - Kheri","Lalitpur","Lucknow","Maharajganj","Mahoba","Mainpuri","Mathura","Mau","Meerut","Mirzapur","Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh","RaeBareli","Rampur","Saharanpur","Sambhal (Bhim Nagar)","Sant Kabir Nagar","Shahjahanpur","Shamali (Prabuddh Nagar)","Shravasti","Siddharth Nagar","Sitapur","Sonbhadra","Sultanpur","Unnao","Varanasi"],
  "West Bengal": ["Alipurduar","Bankura","Birbhum","Burdwan (Bardhaman)","Cooch Behar","Dakshin Dinajpur (South Dinajpur)","Darjeeling","Hooghly","Howrah","Jalpaiguri","Kalimpong","Kolkata","Malda","Murshidabad","Nadia","North 24 Parganas","Paschim Medinipur (West Medinipur)","Purba Medinipur (East Medinipur)","Purulia","South 24 Parganas","Uttar Dinajpur (North Dinajpur)"],
}

const USER_TYPE_OPTIONS = [
  'Architect/Interior designer',
  'Dealer',
  'Distributor',
  'OEM',
  'Contractor',
  'End Customer',
].map(t => ({ value: t, label: t }))

const PRODUCT_OPTIONS = [
  { value: '1mm+ Laminates',    label: '1mm+ Laminates' },
  { value: '0.8mm Laminates',   label: '0.8mm Laminates' },
  { value: 'FR Flexi Laminates', label: 'FR Flexi Laminates' },
  { value: 'Acrylish Laminates', label: 'Acrylish Laminates' },
  { value: 'Soffitto',          label: 'Soffitto' },
  { value: 'MDF',               label: 'MDF' },
  { value: 'Skybond',           label: 'Skybond' },
]

const STATE_OPTIONS = Object.keys(STATE_CITY_MAP).map(s => ({ value: s, label: s }))

const AddShowroomLead = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      fullName:       '',
      email:          '',
      mobileNumber:   '',
      userType:       '',
      productType:    [],
      companyName:    '',
      state:          '',
      city:           '',
      representative: '',
    },
  })

  const selectedState = watch('state')
  const cityOptions = selectedState
    ? (STATE_CITY_MAP[selectedState] ?? []).map(c => ({ value: c, label: c }))
    : []

  const onSubmit = async (values) => {
    setServerError('')
    if (!values.productType?.length) {
      setServerError('Please select at least one product.')
      return
    }
    setSubmitting(true)
    try {
      await apiFetch('/api/lead/showroom/contact-form-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      navigate('/showroom-leads')
    } catch (err) {
      setServerError(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Dark-theme styles for ReactSelect to match the form card bg (#333)
  const darkSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#2b2b2b',
      borderColor: state.isFocused ? '#6c757d' : '#444',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(108,117,125,.25)' : 'none',
      '&:hover': { borderColor: '#6c757d' },
    }),
    menu: (base) => ({ ...base, backgroundColor: '#2b2b2b', zIndex: 9999 }),
    menuList: (base) => ({ ...base, backgroundColor: '#2b2b2b' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#3d3d3d' : state.isSelected ? '#495057' : 'transparent',
      color: '#dee2e6',
      '&:active': { backgroundColor: '#495057' },
    }),
    singleValue: (base) => ({ ...base, color: '#dee2e6' }),
    multiValue: (base) => ({ ...base, backgroundColor: '#495057' }),
    multiValueLabel: (base) => ({ ...base, color: '#dee2e6' }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#adb5bd',
      '&:hover': { backgroundColor: '#dc3545', color: '#fff' },
    }),
    placeholder: (base) => ({ ...base, color: '#6c757d' }),
    input: (base) => ({ ...base, color: '#dee2e6' }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: '#444' }),
    dropdownIndicator: (base) => ({ ...base, color: '#6c757d' }),
    clearIndicator: (base) => ({ ...base, color: '#6c757d' }),
    noOptionsMessage: (base) => ({ ...base, color: '#6c757d', backgroundColor: '#2b2b2b' }),
  }

  return (
    <>
      <PageMetaData title="Add Showroom Enquiry" />
      <PageBreadcrumb title="Add Showroom Enquiry" subName="Showroom Enquiry" />

      <Row>
        <Col>
          {/* outer card — dark grey body */}
          <Card style={{ backgroundColor: '#3a3a3a', border: '1px solid #444' }}>
            <CardBody style={{ backgroundColor: '#3a3a3a' }}>

              {serverError && (
                <div className="alert alert-danger alert-dismissible mb-3" role="alert">
                  <IconifyIcon icon="bx:error-circle" className="me-2" />
                  {serverError}
                  <button type="button" className="btn-close" onClick={() => setServerError('')} />
                </div>
              )}

              {/* inner form panel — #333 */}
              <div className="rounded p-4" style={{ backgroundColor: '#333' }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Row>

                    <Col md={6}>
                      <TextFormInput
                        control={control}
                        name="fullName"
                        label="Full Name"
                        placeholder="Enter full name"
                        containerClassName="mb-3 lead-form-field"
                        rules={{ required: 'Full name is required', minLength: { value: 2, message: 'Min 2 characters' } }}
                      />
                    </Col>
                    <Col md={6}>
                      <TextFormInput
                        control={control}
                        name="mobileNumber"
                        label="Mobile Number"
                        placeholder="10-digit mobile number"
                        containerClassName="mb-3 lead-form-field"
                        rules={{ required: 'Mobile number is required' }}
                      />
                    </Col>

                    <Col md={6}>
                      <TextFormInput
                        control={control}
                        name="email"
                        label="Email (optional)"
                        type="email"
                        placeholder="email@example.com"
                        containerClassName="mb-3 lead-form-field"
                      />
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-light">User Type</label>
                        <Controller
                          name="userType"
                          control={control}
                          rules={{ required: 'User type is required' }}
                          render={({ field, fieldState }) => (
                            <>
                              <ReactSelect
                                options={USER_TYPE_OPTIONS}
                                placeholder="Select user type..."
                                classNamePrefix="react-select"
                                styles={darkSelectStyles}
                                onChange={opt => field.onChange(opt?.value ?? '')}
                                value={USER_TYPE_OPTIONS.find(o => o.value === field.value) ?? null}
                              />
                              {fieldState.error && (
                                <div className="text-danger small mt-1">{fieldState.error.message}</div>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </Col>

                    <Col md={12}>
                      <div className="mb-3">
                        <label className="form-label text-light">Product Enquiry</label>
                        <Controller
                          name="productType"
                          control={control}
                          render={({ field }) => (
                            <ReactSelect
                              isMulti
                              options={PRODUCT_OPTIONS}
                              placeholder="Select products..."
                              classNamePrefix="react-select"
                              styles={darkSelectStyles}
                              onChange={opts => field.onChange(opts ? opts.map(o => o.value) : [])}
                              value={PRODUCT_OPTIONS.filter(o => field.value?.includes(o.value))}
                            />
                          )}
                        />
                      </div>
                    </Col>

                    <Col md={12}>
                      <TextFormInput
                        control={control}
                        name="companyName"
                        label="Firm Name & Address"
                        placeholder="Enter firm name and full address"
                        containerClassName="mb-3 lead-form-field"
                        rules={{ required: 'Firm name is required' }}
                      />
                    </Col>

                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-light">State</label>
                        <Controller
                          name="state"
                          control={control}
                          rules={{ required: 'State is required' }}
                          render={({ field, fieldState }) => (
                            <>
                              <ReactSelect
                                options={STATE_OPTIONS}
                                placeholder="Select state..."
                                classNamePrefix="react-select"
                                styles={darkSelectStyles}
                                onChange={opt => {
                                  field.onChange(opt?.value ?? '')
                                  setValue('city', '')
                                }}
                                value={STATE_OPTIONS.find(o => o.value === field.value) ?? null}
                              />
                              {fieldState.error && (
                                <div className="text-danger small mt-1">{fieldState.error.message}</div>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-light">City</label>
                        <Controller
                          name="city"
                          control={control}
                          rules={{ required: 'City is required' }}
                          render={({ field, fieldState }) => (
                            <>
                              <ReactSelect
                                options={cityOptions}
                                placeholder={selectedState ? 'Select city...' : 'Select state first'}
                                classNamePrefix="react-select"
                                styles={darkSelectStyles}
                                isDisabled={!selectedState}
                                onChange={opt => field.onChange(opt?.value ?? '')}
                                value={cityOptions.find(o => o.value === field.value) ?? null}
                              />
                              {fieldState.error && (
                                <div className="text-danger small mt-1">{fieldState.error.message}</div>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </Col>

                    <Col md={6}>
                      <TextFormInput
                        control={control}
                        name="representative"
                        label="Representative"
                        placeholder="Representative name"
                        containerClassName="mb-3 lead-form-field"
                        rules={{ required: 'Representative is required' }}
                      />
                    </Col>

                  </Row>

                  <div className="d-flex gap-2 mt-2">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting
                        ? <><span className="spinner-border spinner-border-sm me-1" role="status" />&nbsp;Saving...</>
                        : <><IconifyIcon icon="bx:check" className="me-1" />Save Lead</>
                      }
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/showroom-leads')}
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              </div>

            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default AddShowroomLead
