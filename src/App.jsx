import React, { useState, useEffect } from 'react';
import { Upload, Inbox, UserCircle, Phone, Mail, Building, CheckCircle, CreditCard, Briefcase, ArrowRight, Package, ImageIcon, Loader, XCircle, Sparkles, PlusCircle, ArrowUpCircle } from 'lucide-react';


const UPSBusinessCardForm = () => {
  const [hasDesign, setHasDesign] = useState(true);
  const [designChoice, setDesignChoice] = useState('have'); // 'have', 'need', 'ai'
  const [hasLogo, setHasLogo] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedDesign, setUploadedDesign] = useState(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState('10');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    cardStyle: 'professional',
  });
  const [isAnimating, setIsAnimating] = useState(false);


  // Pricing structure
  const quantities = [
    { amount: '10', price: 0, label: 'Free Sample', savings: null },
    { amount: '50', price: 18, label: 'Starter Pack', savings: null },
    { amount: '100', price: 20, label: 'Most Popular', savings: 'Save 60%' },
    { amount: '250', price: 30, label: 'Best Value', savings: 'Save 76%' },
    { amount: '500', price: 50, label: 'Business Pro', savings: 'Save 80%' },
  ];


  const addOns = [
    { id: 'logo', name: 'Professional Logo Design', price: 5, description: 'Custom logo created by our designers' },
    { id: 'enhance', name: 'Design Enhancement', price: 10, description: 'Professional touch-ups to make your design pop' },
    { id: 'rush', name: 'Rush Processing', price: 15, description: 'Get your cards in 2 business days' },
  ];


  const calculateTotal = () => {
    const basePrice = quantities.find(q => q.amount === selectedQuantity)?.price || 0;
    const addOnTotal = selectedAddOns.reduce((sum, addOnId) => {
      return sum + (addOns.find(a => a.id === addOnId)?.price || 0);
    }, 0);
    const aiDesignFee = designChoice === 'ai' ? 10 : 0;
    return basePrice + addOnTotal + aiDesignFee;
  };


  // Toggle add-ons
  const toggleAddOn = (addOnId) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };


  // Add a smooth scroll effect when changing steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };


  const handleDesignChoiceChange = (choice) => {
    setIsAnimating(true);
    setTimeout(() => {
      setDesignChoice(choice);
      setIsAnimating(false);
    }, 300);
  };


  const handleNextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveStep(prevStep => prevStep + 1);
      setIsAnimating(false);
    }, 300);
  };


  const handlePrevStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveStep(prevStep => prevStep - 1);
      setIsAnimating(false);
    }, 300);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnimating(true);
  
    // Create FormData object
    const formPayload = new FormData();
  
    // 1. Add all personal information
    formPayload.append('Full Name', formData.fullName);
    formPayload.append('Email', formData.email);
    formPayload.append('Phone', formData.phone);
    formPayload.append('Company', formData.company);
    formPayload.append('Job Title', formData.jobTitle);
  
    // 2. Add design information
    formPayload.append('Card Style', formData.cardStyle);
    formPayload.append('Design Choice', 
      designChoice === 'have' ? 'Uploaded Custom Design' : 
      designChoice === 'need' ? 'Selected Template' : 
      'AI-Enhanced Design');
  
    // 3. Handle design file upload (for "I have a design" option)
    if (designChoice === 'have' && uploadedDesign) {
      try {
        const designFile = await dataURLtoFile(uploadedDesign, 'business-card-design.png');
        formPayload.append('design_file', designFile);
      } catch (error) {
        console.error('Error processing design file:', error);
      }
    }
  
    // 4. Handle logo file upload (from template options)
    if (uploadedLogo) {
      try {
        const logoFile = await dataURLtoFile(uploadedLogo, 'company-logo.png');
        formPayload.append('logo_file', logoFile);
      } catch (error) {
        console.error('Error processing logo file:', error);
      }
    }
  
    // 5. Add quantity and pricing information
    const quantityInfo = quantities.find(q => q.amount === selectedQuantity);
    formPayload.append('Quantity', `${selectedQuantity} cards (${quantityInfo.label})`);
    formPayload.append('Base Price', `$${quantityInfo.price}`);
  
    // 6. Add add-ons information
    if (selectedAddOns.length > 0) {
      selectedAddOns.forEach(addOnId => {
        const addOn = addOns.find(a => a.id === addOnId);
        formPayload.append(`Add-on: ${addOn.name}`, `+$${addOn.price}`);
      });
    } else {
      formPayload.append('Add-ons', 'None selected');
    }
  
    // 7. Add total price
    formPayload.append('Total Price', `$${calculateTotal()}`);
  
    // 8. Email configuration
    formPayload.append('_subject', `New Business Card Order: ${formData.fullName}`);
    formPayload.append('_template', 'table');
    formPayload.append('_replyto', formData.email);
    
    // Critical for attachments to work
    formPayload.append('_captcha', 'false'); // Disable captcha if not needed
    formPayload.append('_attachments', 'design_file,logo_file'); // List all attachment fields
  
    try {
      const response = await fetch("https://formsubmit.co/ajax/b12fcd0c12d54cc87f3fba55414237d4", {
        method: "POST",
        body: formPayload
      });
  
      const result = await response.json();
      if (result.success) {
        setFormSubmitted(true);
      } else {
        alert("Submission failed. Please try again or contact support.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your form. Please try again.");
    } finally {
      setIsAnimating(false);
    }
  };
  
  // Helper function to convert data URL to File object
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };  
  
  // Handle file uploads (simulated)
  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'design') {
            setUploadedDesign(reader.result);
          } else {
            setUploadedLogo(reader.result);
          }
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }, 1000);
    }
  };


  // Sample card designs with different font styles
  const cardStyles = [
    {
      id: 'professional',
      name: 'Professional',
      font: 'font-serif',
      nameSize: 'text-lg',
      titleSize: 'text-sm',
      companySize: 'text-sm',
      contactSize: 'text-xs',
      nameWeight: 'font-bold',
      logoPosition: 'top-right'
    },
    {
      id: 'elegant',
      name: 'Elegant',
      font: 'font-serif italic',
      nameSize: 'text-xl',
      titleSize: 'text-xs',
      companySize: 'text-sm',
      contactSize: 'text-xs',
      nameWeight: 'font-medium',
      logoPosition: 'top-right'
    },
    {
      id: 'modern',
      name: 'Modern',
      font: 'font-sans',
      nameSize: 'text-xl',
      titleSize: 'text-sm',
      companySize: 'text-base',
      contactSize: 'text-xs',
      nameWeight: 'font-bold',
      logoPosition: 'top-right'
    },
    {
      id: 'bold',
      name: 'Bold',
      font: 'font-mono',
      nameSize: 'text-2xl',
      titleSize: 'text-sm',
      companySize: 'text-base',
      contactSize: 'text-xs',
      nameWeight: 'font-black uppercase',
      logoPosition: 'top-right'
    },
  ];


  // Business card preview based on form data
  const BusinessCardPreview = () => {
    const style = cardStyles.find(s => s.id === formData.cardStyle) || cardStyles[0];
   
    return (
      <div className="relative w-full" style={{ paddingTop: '57.143%' }}> {/* Maintains 3.5:2 aspect ratio */}
        <div className="absolute inset-0 bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
          {designChoice === 'have' && uploadedDesign ? (
            <img
              src={uploadedDesign}
              alt="Business Card Design"
              className="w-full h-full object-cover"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className={`relative p-6 h-full flex flex-col justify-between ${style.font}`}>
              {/* Logo placement - Now always top-right and larger */}
              {uploadedLogo && (
                <div className="absolute top-4 right-4">
                  <img src={uploadedLogo} alt="Company Logo" className="h-12 w-auto object-contain" />
                </div>
              )}
             
              {/* Content adjusted based on logo position */}
              <div>
                <h3 className={`${style.nameSize} ${style.nameWeight} text-gray-900`}>
                  {formData.fullName || 'Your Name'}
                </h3>
                <p className={`${style.titleSize} text-gray-600 mt-1`}>
                  {formData.jobTitle || 'Position'}
                </p>
                <p className={`${style.companySize} text-gray-700 mt-1`}>
                  {formData.company || 'Company Name'}
                </p>
              </div>
             
              <div className="mt-4">
                <div className={`flex items-center text-gray-600 ${style.contactSize} mb-1`}>
                  <Phone size={12} className="mr-2" />
                  <span>{formData.phone || '(555) 123-4567'}</span>
                </div>
                <div className={`flex items-center text-gray-600 ${style.contactSize}`}>
                  <Mail size={12} className="mr-2" />
                  <span>{formData.email || 'your.email@example.com'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  // Preview Card Styles Component
  const StylePreviewCard = ({ style }) => {
    return (
      <button
        type="button"
        onClick={() => setFormData({...formData, cardStyle: style.id})}
        className={`relative p-4 rounded-lg transition-all duration-200 border-2 ${
          formData.cardStyle === style.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-200 bg-white'
        }`}
      >
        <div className={`h-24 bg-white rounded border border-gray-200 p-3 ${style.font}`}>
          <h4 className={`${style.nameSize} ${style.nameWeight} text-gray-900`}>John Doe</h4>
          <p className={`${style.titleSize} text-gray-600 mt-1`}>Marketing Manager</p>
          <p className={`${style.companySize} text-gray-700 mt-1`}>Acme Corp</p>
        </div>
        <span className="block text-center mt-2 font-medium text-sm">{style.name}</span>
      </button>
    );
  };


  if (formSubmitted) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-xl max-w-lg mx-auto">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25"></div>
        <CheckCircle className="relative text-green-500 w-20 h-20" />
      </div>
      <h2 className="text-3xl font-bold text-blue-800 mb-4">Thank You!</h2>
      <p className="text-center text-gray-700 mb-6">
        Your 10 free business cards are on the way! We're excited to help you make a great impression.
      </p>
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-medium text-gray-700 mb-4">Order Summary</h3>
        <div className="space-y-2 text-gray-600">
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span className="font-medium">{selectedQuantity} cards</span>
          </div>
          <div className="flex justify-between">
            <span>Design Type:</span>
            <span className="font-medium">
              {designChoice === 'have' ? 'Custom Design' :
               designChoice === 'need' ? 'Template Design' :
               'AI-Enhanced Design'}
            </span>
          </div>
          {selectedAddOns.length > 0 && (
            <div className="border-t pt-2 mt-2">
              <span className="font-medium">Add-ons:</span>
              <ul className="pl-4 list-disc">
                {selectedAddOns.map(addOnId => {
                  const addOn = addOns.find(a => a.id === addOnId);
                  return <li key={addOnId}>{addOn?.name}</li>;
                })}
              </ul>
            </div>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Total:</span>
            <span>${calculateTotal()}</span>
          </div>
        </div>
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <p className="text-blue-800 font-medium mb-2">Questions, quotes, or concerns?</p>
          <p className="text-blue-800 flex items-center">
            <Phone size={16} className="mr-2" />
            Contact Sherry, our print specialist: <a href="tel:6479043777" className="font-bold ml-1 text-blue-600 hover:underline">(647) 904-3777</a>
          </p>
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Progress bar and steps */}
        <div className="mb-8 px-4">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center ${step < activeStep ? 'text-green-600' : step === activeStep ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-medium transition-all duration-300 ${
                    step < activeStep
                      ? 'bg-green-100 text-green-600 border border-green-600'
                      : step === activeStep
                        ? 'bg-blue-100 text-blue-600 border border-blue-600'
                        : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }`}
                >
                  {step < activeStep ? <CheckCircle size={16} /> : step}
                </div>
                <span className="text-xs mt-1 font-medium">
                  {step === 1 ? 'Info' : step === 2 ? 'Design' : step === 3 ? 'Quantity' : 'Preview'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>


        {/* Main form card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          {/* Header with UPS branding */}
          <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-white opacity-20"></div>
            </div>
            <div className="flex items-center justify-between relative">
              <div>
                <h1 className="text-3xl font-bold text-brown-900">The UPS Store</h1>
                <p className="text-brown-800 font-medium text-lg">Professional Business Cards</p>
              </div>
              <div className="bg-brown-900 text-yellow-400 py-2 px-4 rounded-lg font-bold transform rotate-3 shadow-lg border-2 border-white animate-pulse">
              <span className="text-lg">FREE 10 CARDS</span>
              </div>
            </div>
            <p className="text-brown-800 mt-4 max-w-lg relative">
              Get 10 premium business cards free, or upgrade for more.
            </p>
          </div>


          <form onSubmit={handleSubmit} className="p-6">
            <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              {activeStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                    <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                      <UserCircle className="mr-2" size={24} />
                      Personal Information
                    </h2>
                   
                    <div className="space-y-4">
                      <div className="group">
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                          Full Name*
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-blue-300"
                          placeholder="John Doe"
                        />
                      </div>
                     
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                            <Mail className="inline mr-1" size={16} /> Email Address*
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-blue-300"
                            placeholder="john@example.com"
                          />
                        </div>
                       
                        <div className="group">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                            <Phone className="inline mr-1" size={16} /> Phone Number*
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-blue-300"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-lg border border-amber-100">
                    <h2 className="text-xl font-bold text-amber-700 mb-4 flex items-center">
                      <Briefcase className="mr-2" size={24} />
                      Professional Details
                    </h2>
                   
                    <div className="space-y-4">
                      <div className="group">
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-amber-600 transition-colors duration-200">
                          <Building className="inline mr-1" size={16} /> Company Name
                        </label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 shadow-sm hover:border-amber-300"
                          placeholder="Your Company"
                        />
                      </div>
                     
                      <div className="group">
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-amber-600 transition-colors duration-200">
                          Job Title
                        </label>
                        <input
                          id="jobTitle"
                          name="jobTitle"
                          type="text"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 shadow-sm hover:border-amber-300"
                          placeholder="Marketing Manager"
                        />
                      </div>
                    </div>
                  </div>


                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:translate-x-1 flex items-center group"
                    >
                      Next Step
                      <ArrowRight className="ml-2 group-hover:ml-3 transition-all duration-200" size={20} />
                    </button>
                  </div>
                </div>
              )}


              {activeStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                    <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                      <CreditCard className="mr-2" size={24} />
                      Design Options
                    </h2>
                   
                    <p className="text-gray-600 mb-6">
                      Choose how you'd like to proceed with your business card design.
                    </p>
                   
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => handleDesignChoiceChange('have')}
                        className={`p-4 rounded-lg transition-all duration-200 flex flex-col items-center ${
                          designChoice === 'have'
                            ? 'bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 shadow-md'
                            : 'bg-white border border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                          designChoice === 'have' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Upload size={28} />
                        </div>
                        <h3 className={`font-bold text-lg ${designChoice === 'have' ? 'text-purple-700' : 'text-gray-700'}`}>
                          I Have a Design
                        </h3>
                        <p className={`text-center text-sm mt-1 ${designChoice === 'have' ? 'text-purple-600' : 'text-gray-500'}`}>
                          Upload your own design (3.5" x 2")
                        </p>
                      </button>
                     
                      <button
                        type="button"
                        onClick={() => handleDesignChoiceChange('need')}
                        className={`p-4 rounded-lg transition-all duration-200 flex flex-col items-center ${
                          designChoice === 'need'
                            ? 'bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-300 shadow-md'
                            : 'bg-white border border-gray-200 hover:border-pink-200'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                          designChoice === 'need' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Inbox size={28} />
                        </div>
                        <h3 className={`font-bold text-lg ${designChoice === 'need' ? 'text-pink-700' : 'text-gray-700'}`}>
                          Use Templates
                        </h3>
                        <p className={`text-center text-sm mt-1 ${designChoice === 'need' ? 'text-pink-600' : 'text-gray-500'}`}>
                          Choose from our professional templates
                        </p>
                      </button>
                     
                      <button
                        type="button"
                        onClick={() => handleDesignChoiceChange('ai')}
                        className={`p-4 rounded-lg transition-all duration-200 flex flex-col items-center relative ${
                          designChoice === 'ai'
                            ? 'bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 shadow-md'
                            : 'bg-white border border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          +$10
                        </div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                          designChoice === 'ai' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Sparkles size={28} />
                        </div>
                        <h3 className={`font-bold text-lg ${designChoice === 'ai' ? 'text-blue-700' : 'text-gray-700'}`}>
                          AI-Enhanced Design
                        </h3>
                        <p className={`text-center text-sm mt-1 ${designChoice === 'ai' ? 'text-blue-600' : 'text-gray-500'}`}>
                          Let AI optimize your card for maximum impact
                        </p>
                      </button>
                    </div>
                   
                    {designChoice === 'have' && (
                      <div className="mt-6">
                        <label className="block">
                          <div className={`p-6 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50 text-center hover:bg-purple-100 transition-colors duration-200 cursor-pointer relative ${isUploading ? 'opacity-50' : ''}`}>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf,.ai,.psd"
                              onChange={(e) => handleFileUpload(e, 'design')}
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <div className="flex flex-col items-center">
                                <Loader className="animate-spin h-12 w-12 text-purple-400" />
                                <p className="text-purple-800 font-medium mt-4">Uploading your design...</p>
                              </div>
                            ) : uploadedDesign ? (
                              <div className="flex flex-col items-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                                <p className="text-green-800 font-medium mt-4">Design uploaded successfully!</p>
                                <p className="text-green-600 text-sm mt-2">
                                  Click again to change the file
                                </p>
                              </div>
                            ) : (
                              <>
                                <Upload className="mx-auto h-12 w-12 text-purple-400" />
                                <div className="mt-4">
                                  <p className="text-purple-800 font-medium">
                                    Click to upload your business card design
                                  </p>
                                  <p className="text-purple-600 text-sm mt-2">
                                    Dimensions: 3.5" x 2" | Supported formats: PDF, AI, PSD, JPG, PNG
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                    )}
                   
                    {(designChoice === 'need' || designChoice === 'ai') && (
                      <div className="mt-6">
                        <div className="p-6 border border-pink-200 rounded-lg bg-pink-50">
                          <h3 className="font-medium text-pink-800 mb-4">Select Your Card Style</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cardStyles.map(style => (
                              <StylePreviewCard key={style.id} style={style} />
                            ))}
                          </div>
                         
                          <div className="mt-6">
                            <h3 className="font-medium text-pink-800 mb-3">Company Logo (Optional)</h3>
                            <div className="flex space-x-4">
                              <button
                                type="button"
                                onClick={() => setHasLogo(true)}
                                className={`flex-1 p-3 rounded-md transition-all duration-200 flex items-center justify-center ${
                                  hasLogo
                                    ? 'bg-pink-100 border-2 border-pink-300'
                                    : 'bg-white border border-gray-200 hover:border-pink-200'
                                }`}
                              >
                                <ImageIcon size={20} className={hasLogo ? 'text-pink-600 mr-2' : 'text-gray-400 mr-2'} />
                                Upload Logo
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setHasLogo(false);
                                  setUploadedLogo(null);
                                }}
                                className={`flex-1 p-3 rounded-md transition-all duration-200 flex items-center justify-center ${
                                  !hasLogo
                                    ? 'bg-pink-100 border-2 border-pink-300'
                                    : 'bg-white border border-gray-200 hover:border-pink-200'
                                }`}
                              >
                                <XCircle size={20} className={!hasLogo ? 'text-pink-600 mr-2' : 'text-gray-400 mr-2'} />
                                No Logo
                              </button>
                            </div>
                           
                            {hasLogo && (
                              <label className="mt-4 block">
                                <div className={`p-4 border-2 border-dashed border-pink-200 rounded-lg bg-white text-center hover:bg-pink-50 transition-colors duration-200 cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'logo')}
                                    disabled={isUploading}
                                  />
                                  {uploadedLogo ? (
                                    <div className="flex items-center justify-center">
                                      <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                                      <span className="text-green-700 font-medium">Logo uploaded</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center">
                                      <Upload className="h-6 w-6 text-pink-400 mr-2" />
                                      <span className="text-gray-600">Click to upload logo</span>
                                    </div>
                                  )}
                                </div>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                   
                    {/* Add-on Services */}
                    <div className="mt-6">
                      <h3 className="font-medium text-purple-800 mb-3">Enhance Your Design</h3>
                      <div className="space-y-3">
                        {addOns.map(addOn => (
                          <button
                            key={addOn.id}
                            type="button"
                            onClick={() => toggleAddOn(addOn.id)}
                            className={`w-full p-4 rounded-lg flex items-center justify-between transition-all duration-200 ${
                              selectedAddOns.includes(addOn.id)
                                ? 'bg-green-50 border-2 border-green-200'
                                : 'bg-white border border-gray-200 hover:border-green-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                                selectedAddOns.includes(addOn.id)
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedAddOns.includes(addOn.id) && (
                                  <CheckCircle size={14} className="text-white" />
                                )}
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-gray-800">{addOn.name}</p>
                                <p className="text-sm text-gray-500">{addOn.description}</p>
                              </div>
                            </div>
                            <span className="font-bold text-gray-700">+${addOn.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                 
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-5 rounded-lg transition duration-150 ease-in-out"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:translate-x-1 flex items-center group"
                    >
                      Choose Quantity
                      <ArrowRight className="ml-2 group-hover:ml-3 transition-all duration-200" size={20} />
                    </button>
                  </div>
                </div>
              )}


              {activeStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-100">
                    <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                      <ArrowUpCircle className="mr-2" size={24} />
                      10 Cards Isn't Enough? Upgrade Now!
                    </h2>
                   
                    <p className="text-gray-600 mb-6">
                      Choose your quantity and save more with bulk pricing. All prices are for single-sided cards.
                    </p>
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {quantities.map(quantity => (
                        <button
                          key={quantity.amount}
                          type="button"
                          onClick={() => setSelectedQuantity(quantity.amount)}
                          className={`relative p-4 rounded-lg transition-all duration-200 flex flex-col items-center border-2 ${
                            selectedQuantity === quantity.amount
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-200 bg-white'
                          }`}
                        >
                          {quantity.savings && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12">
                              {quantity.savings}
                            </div>
                          )}
                          {quantity.label === 'Most Popular' && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              POPULAR
                            </div>
                          )}
                          <span className="text-3xl font-bold text-gray-800">{quantity.amount}</span>
                          <span className="text-sm text-gray-600 mt-1">{quantity.label}</span>
                          <span className="text-lg font-bold text-orange-600 mt-2">
                            {quantity.price === 0 ? 'FREE' : `${quantity.price}`}
                          </span>
                        </button>
                      ))}
                    </div>
                   
                    <div className="mt-8 p-4 bg-orange-100 rounded-lg">
                      <h3 className="font-bold text-orange-800 mb-2">💡 Smart Business Decision</h3>
                      <p className="text-orange-700 text-sm">
                        Ordering 250+ cards saves you up to 80% compared to buying in small batches.
                        Business cards are your most cost-effective marketing tool!
                      </p>
                    </div>
                  </div>
                 
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-5 rounded-lg transition duration-150 ease-in-out"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:translate-x-1 flex items-center group"
                    >
                      Review Order
                      <ArrowRight className="ml-2 group-hover:ml-3 transition-all duration-200" size={20} />
                    </button>
                  </div>
                </div>
              )}


              {activeStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg border border-green-100">
                    <h2 className="text-xl font-bold text-green-800 mb-2 flex items-center">
                      <CreditCard className="mr-2" size={24} />
                      Preview Your Business Card
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Review your design and order details before finalizing.
                    </p>
                   
                    <div className="mb-8 max-w-md mx-auto">
                      <BusinessCardPreview />
                    </div>
                   
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-700 mb-3">Order Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Quantity:</span>
                          <span className="col-span-2 font-medium">{selectedQuantity} cards</span>
                        </div>
                        <div className="grid grid-cols-3">
                          <span className="text-gray-500">Design Type:</span>
                          <span className="col-span-2 font-medium">
                            {designChoice === 'have' ? 'Custom Design' :
                             designChoice === 'need' ? 'Template Design' :
                             'AI-Enhanced Design (+$10)'}
                          </span>
                        </div>
                        {selectedAddOns.length > 0 && (
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <span className="font-medium text-gray-700">Add-ons:</span>
                            <ul className="mt-1 space-y-1">
                              {selectedAddOns.map(addOnId => {
                                const addOn = addOns.find(a => a.id === addOnId);
                                return (
                                  <li key={addOnId} className="flex justify-between items-center">
                                    <span className="text-gray-600">{addOn?.name}</span>
                                    <span className="text-gray-700 font-medium">+${addOn?.price}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between text-lg">
                            <span className="font-bold text-gray-800">Total:</span>
                            <span className="font-bold text-green-600">${calculateTotal()}</span>
                          </div>
                          {selectedQuantity === '10' && (
                            <p className="text-center text-sm text-gray-500 mt-1">
                              Free sample order - no charges
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                 
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
                      <Package className="mr-2" size={20} />
                      What You're Getting:
                    </h3>
                    <ul className="space-y-2 text-yellow-700">
                      <li className="flex items-center">
                        <CheckCircle className="mr-2 text-green-500" size={16} />
                        {selectedQuantity} premium quality business cards
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="mr-2 text-green-500" size={16} />
                        Professional 14pt paper stock
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="mr-2 text-green-500" size={16} />
                        Full-color printing
                      </li>
                      {designChoice === 'ai' && (
                        <li className="flex items-center">
                          <CheckCircle className="mr-2 text-green-500" size={16} />
                          AI-optimized design for maximum impact
                        </li>
                      )}
                      {selectedAddOns.length > 0 && selectedAddOns.map(addOnId => {
                        const addOn = addOns.find(a => a.id === addOnId);
                        return (
                          <li key={addOnId} className="flex items-center">
                            <CheckCircle className="mr-2 text-green-500" size={16} />
                            {addOn?.name}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                 
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        I agree to The UPS Store's <span className="text-blue-600 cursor-pointer hover:underline">Terms & Conditions</span> and consent to be contacted about my business card order.
                      </label>
                    </div>
                   
                    <div className="flex items-start">
                      <input
                        id="marketing"
                        name="marketing"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
                        Keep me updated about special offers and business services from The UPS Store (optional).
                      </label>
                    </div>
                   
                    <div className="flex justify-between mt-8">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-5 rounded-lg transition duration-150 ease-in-out"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-brown-900 font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
                      >
                        {calculateTotal() === 0 ? 'Get My Free Cards' : `Complete Order - ${calculateTotal()}`}
                        <ArrowRight className="ml-2" size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default UPSBusinessCardForm;