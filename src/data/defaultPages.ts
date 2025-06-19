
export const defaultMainPages = [
  {
    id: 'contact_form',
    name: 'Contact Form',
    description: 'Professional contact form for business inquiries',
  },
  {
    id: 'survey_form',
    name: 'Survey Form',
    description: 'Customer feedback and survey collection',
  },
  {
    id: 'newsletter_signup',
    name: 'Newsletter Signup',
    description: 'Email subscription and newsletter signup',
  },
  {
    id: 'lead_generation',
    name: 'Lead Generation',
    description: 'Sales lead capture and qualification',
  },
  {
    id: 'event_registration',
    name: 'Event Registration',
    description: 'Event registration and attendee management',
  },
  {
    id: 'job_application',
    name: 'Job Application',
    description: 'Career application and resume submission',
  },
  {
    id: 'product_inquiry',
    name: 'Product Inquiry',
    description: 'Product information requests and demos',
  },
  {
    id: 'support_ticket',
    name: 'Support Ticket',
    description: 'Customer support and help desk forms',
  },
  {
    id: 'booking_form',
    name: 'Booking Form',
    description: 'Appointment and service booking',
  },
  {
    id: 'feedback_form',
    name: 'Feedback Form',
    description: 'General feedback and suggestions',
  },
];

export const defaultSubPages = [
  // Contact Form Sub Pages
  {
    id: 'contact_basic',
    main_page_id: 'contact_form',
    name: 'Basic Contact Form',
    description: 'Simple contact form with name, email, and message',
    fields: ['name', 'email', 'message'],
    html: `
      <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Contact Us</h2>
        <form id="contactForm" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" id="name" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" id="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea id="message" name="message" rows="4" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">Send Message</button>
        </form>
      </div>
    `,
    css: `
      body { font-family: 'Inter', system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
      .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    `,
    javascript: `
      document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        window.submitSessionData(data);
      });
    `,
  },
  // Survey Form Sub Pages
  {
    id: 'survey_customer_satisfaction',
    main_page_id: 'survey_form',
    name: 'Customer Satisfaction Survey',
    description: 'Customer satisfaction rating and feedback',
    fields: ['satisfaction_rating', 'recommend', 'feedback', 'improvement_areas'],
    html: `
      <div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Customer Satisfaction Survey</h2>
        <form id="surveyForm" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">How satisfied are you with our service?</label>
            <div class="flex space-x-2">
              ${[1,2,3,4,5].map(n => `
                <label class="flex flex-col items-center cursor-pointer">
                  <input type="radio" name="satisfaction_rating" value="${n}" class="sr-only">
                  <div class="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-semibold hover:border-blue-500 transition-colors rating-btn">${n}</div>
                  <span class="text-xs mt-1 text-gray-600">${n === 1 ? 'Poor' : n === 5 ? 'Excellent' : ''}</span>
                </label>
              `).join('')}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Would you recommend us to others?</label>
            <select name="recommend" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select an option</option>
              <option value="definitely">Definitely</option>
              <option value="probably">Probably</option>
              <option value="not_sure">Not sure</option>
              <option value="probably_not">Probably not</option>
              <option value="definitely_not">Definitely not</option>
            </select>
          </div>
          <div>
            <label for="feedback" class="block text-sm font-medium text-gray-700 mb-1">Additional Feedback</label>
            <textarea id="feedback" name="feedback" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell us more about your experience..."></textarea>
          </div>
          <button type="submit" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200">Submit Survey</button>
        </form>
      </div>
    `,
    css: `
      body { font-family: 'Inter', system-ui, sans-serif; background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
      .rating-btn { transition: all 0.2s; }
      .rating-btn:hover, input:checked + .rating-btn { background-color: #3b82f6; color: white; border-color: #3b82f6; }
    `,
    javascript: `
      document.getElementById('surveyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        window.submitSessionData(data);
      });
      
      // Rating button interactions
      document.querySelectorAll('input[name="satisfaction_rating"]').forEach(input => {
        input.addEventListener('change', function() {
          document.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('selected'));
          this.nextElementSibling.classList.add('selected');
        });
      });
    `,
  },
  // Newsletter Signup Sub Pages
  {
    id: 'newsletter_modern',
    main_page_id: 'newsletter_signup',
    name: 'Modern Newsletter Signup',
    description: 'Stylish newsletter subscription with preferences',
    fields: ['email', 'name', 'interests', 'frequency'],
    html: `
      <div class="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Stay Updated</h2>
          <p class="text-gray-600">Get the latest news and updates delivered to your inbox.</p>
        </div>
        <form id="newsletterForm" class="space-y-4">
          <div>
            <input type="text" name="name" placeholder="Your Name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
          </div>
          <div>
            <input type="email" name="email" placeholder="Email Address" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Interests</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="checkbox" name="interests" value="technology" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
                <span class="ml-2 text-sm text-gray-700">Technology</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" name="interests" value="business" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
                <span class="ml-2 text-sm text-gray-700">Business</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" name="interests" value="lifestyle" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
                <span class="ml-2 text-sm text-gray-700">Lifestyle</span>
              </label>
            </div>
          </div>
          <div>
            <label for="frequency" class="block text-sm font-medium text-gray-700 mb-2">Email Frequency</label>
            <select name="frequency" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="daily">Daily</option>
              <option value="weekly" selected>Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200 font-semibold">Subscribe Now</button>
        </form>
      </div>
    `,
    css: `
      body { font-family: 'Inter', system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
      .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    `,
    javascript: `
      document.getElementById('newsletterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        // Handle multiple checkbox values
        const interests = Array.from(this.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value);
        data.interests = interests;
        
        window.submitSessionData(data);
      });
    `,
  },
  // Job Application Form
  {
    id: 'job_application_form',
    main_page_id: 'job_application',
    name: 'Job Application Form',
    description: 'Complete job application with resume upload',
    fields: ['full_name', 'email', 'phone', 'position', 'experience', 'cover_letter'],
    html: `
      <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Job Application</h2>
        <form i="jobApplicationForm" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="full_name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" id="full_name" name="full_name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" id="phone" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label for="position" class="block text-sm font-medium text-gray-700 mb-1">Position Applied For</label>
              <select id="position" name="position" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Position</option>
                <option value="developer">Software Developer</option>
                <option value="designer">UI/UX Designer</option>
                <option value="manager">Project Manager</option>
                <option value="analyst">Business Analyst</option>
              </select>
            </div>
          </div>
          <div>
            <label for="experience" class="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <select id="experience" name="experience" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Experience</option>
              <option value="0-1">0-1 years</option>
              <option value="2-3">2-3 years</option>
              <option value="4-5">4-5 years</option>
              <option value="6+">6+ years</option>
            </select>
          </div>
          <div>
            <label for="cover_letter" class="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
            <textarea id="cover_letter" name="cover_letter" rows="6" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell us why you're perfect for this role..."></textarea>
          </div>
          <button type="submit" class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-semibold">Submit Application</button>
        </form>
      </div>
    `,
    css: `
      body { font-family: 'Inter', system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    `,
    javascript: `
      document.getElementById('jobApplicationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        window.submitSessionData(data);
      });
    `,
  },
  // Booking Form
  {
    id: 'appointment_booking',
    main_page_id: 'booking_form',
    name: 'Appointment Booking',
    description: 'Schedule appointments and consultations',
    fields: ['name', 'email', 'phone', 'service', 'date', 'time', 'notes'],
    html: `
      <div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Book an Appointment</h2>
        <form id="bookingForm" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" id="name" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" id="phone" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            </div>
          </div>
          <div>
            <label for="service" class="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select id="service" name="service" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Select Service</option>
              <option value="consultation">Consultation (30min)</option>
              <option value="meeting">Business Meeting (1hr)</option>
              <option value="demo">Product Demo (45min)</option>
              <option value="support">Technical Support (30min)</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <input type="date" id="date" name="date" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            </div>
            <div>
              <label for="time" class="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <select id="time" name="time" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select Time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
              </select>
            </div>
          </div>
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea id="notes" name="notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Any specific requirements or questions?"></textarea>
          </div>
          <button type="submit" class="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-200 font-semibold">Book Appointment</button>
        </form>
      </div>
    `,
    css: `
      body { font-family: 'Inter', system-ui, sans-serif; background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    `,
    javascript: `
      document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        window.submitSessionData(data);
      });
      
      // Set minimum date to today
      document.getElementById('date').min = new Date().toISOString().split('T')[0];
    `,
  },
];
