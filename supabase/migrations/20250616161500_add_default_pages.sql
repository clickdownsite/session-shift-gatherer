
-- Add more default main pages
INSERT INTO main_pages (id, name, description, created_by) VALUES
('ecommerce', 'E-commerce Store', 'Product showcase and checkout pages', 'system'),
('survey', 'Survey & Forms', 'Data collection and feedback forms', 'system'),
('landing', 'Landing Pages', 'Marketing and conversion pages', 'system'),
('contact', 'Contact & Support', 'Customer service and contact forms', 'system'),
('blog', 'Blog & Content', 'Content management and blog pages', 'system')
ON CONFLICT (id) DO NOTHING;

-- Add sub pages for E-commerce
INSERT INTO sub_pages (id, name, description, html, css, javascript, fields, main_page_id, created_by) VALUES
('ecommerce_product', 'Product Page', 'Single product display with add to cart', 
'<div class="product-page">
  <div class="container">
    <div class="product-gallery">
      <img src="https://via.placeholder.com/400x400" alt="Product" class="main-image">
    </div>
    <div class="product-info">
      <h1>Premium Product</h1>
      <p class="price">$99.99</p>
      <p class="description">This is an amazing product that will solve all your problems.</p>
      <form class="add-to-cart-form">
        <input type="hidden" name="product_id" value="prod_001">
        <input type="number" name="quantity" value="1" min="1" max="10">
        <button type="submit" class="add-to-cart-btn">Add to Cart</button>
      </form>
    </div>
  </div>
</div>',
'.product-page { padding: 20px; font-family: Arial, sans-serif; }
.container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.main-image { width: 100%; height: auto; border-radius: 8px; }
.product-info h1 { font-size: 2rem; margin-bottom: 10px; }
.price { font-size: 1.5rem; color: #e44d26; font-weight: bold; margin-bottom: 15px; }
.description { color: #666; margin-bottom: 20px; line-height: 1.6; }
.add-to-cart-form { display: flex; gap: 10px; align-items: center; }
.add-to-cart-btn { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; }
.add-to-cart-btn:hover { background: #0056b3; }',
'', 
'["product_id", "quantity"]', 
'ecommerce', 
'system'),

('ecommerce_checkout', 'Checkout Page', 'Order completion and payment', 
'<div class="checkout-page">
  <div class="container">
    <h1>Checkout</h1>
    <form class="checkout-form">
      <div class="billing-info">
        <h2>Billing Information</h2>
        <input type="text" name="full_name" placeholder="Full Name" required>
        <input type="email" name="email" placeholder="Email Address" required>
        <input type="text" name="address" placeholder="Street Address" required>
        <input type="text" name="city" placeholder="City" required>
        <input type="text" name="zip_code" placeholder="ZIP Code" required>
      </div>
      <div class="payment-info">
        <h2>Payment Information</h2>
        <input type="text" name="card_number" placeholder="Card Number" required>
        <input type="text" name="expiry" placeholder="MM/YY" required>
        <input type="text" name="cvv" placeholder="CVV" required>
      </div>
      <button type="submit" class="complete-order-btn">Complete Order</button>
    </form>
  </div>
</div>',
'.checkout-page { padding: 20px; font-family: Arial, sans-serif; background: #f8f9fa; }
.container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.checkout-form { display: flex; flex-direction: column; gap: 20px; }
.billing-info, .payment-info { display: flex; flex-direction: column; gap: 10px; }
.checkout-form input { padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
.complete-order-btn { background: #28a745; color: white; border: none; padding: 15px; border-radius: 6px; font-size: 18px; cursor: pointer; }
.complete-order-btn:hover { background: #218838; }',
'', 
'["full_name", "email", "address", "city", "zip_code", "card_number", "expiry", "cvv"]', 
'ecommerce', 
'system'),

-- Add sub pages for Survey
('survey_feedback', 'Customer Feedback', 'Product and service feedback form', 
'<div class="survey-page">
  <div class="container">
    <h1>Customer Feedback Survey</h1>
    <form class="survey-form">
      <div class="question">
        <label>How satisfied are you with our service?</label>
        <select name="satisfaction" required>
          <option value="">Select rating</option>
          <option value="very_satisfied">Very Satisfied</option>
          <option value="satisfied">Satisfied</option>
          <option value="neutral">Neutral</option>
          <option value="dissatisfied">Dissatisfied</option>
          <option value="very_dissatisfied">Very Dissatisfied</option>
        </select>
      </div>
      <div class="question">
        <label>What could we improve?</label>
        <textarea name="improvements" rows="4" placeholder="Your suggestions..."></textarea>
      </div>
      <div class="question">
        <label>Would you recommend us to others?</label>
        <div class="radio-group">
          <label><input type="radio" name="recommend" value="yes"> Yes</label>
          <label><input type="radio" name="recommend" value="no"> No</label>
          <label><input type="radio" name="recommend" value="maybe"> Maybe</label>
        </div>
      </div>
      <button type="submit">Submit Feedback</button>
    </form>
  </div>
</div>',
'.survey-page { padding: 20px; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
.container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.survey-form { display: flex; flex-direction: column; gap: 20px; }
.question { display: flex; flex-direction: column; gap: 8px; }
.question label { font-weight: bold; color: #333; }
.survey-form input, .survey-form select, .survey-form textarea { padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; }
.radio-group { display: flex; gap: 15px; }
.radio-group label { font-weight: normal; display: flex; align-items: center; gap: 5px; }
.survey-form button { background: #667eea; color: white; border: none; padding: 15px; border-radius: 8px; font-size: 18px; cursor: pointer; }',
'', 
'["satisfaction", "improvements", "recommend"]', 
'survey', 
'system'),

-- Add sub pages for Landing
('landing_hero', 'Hero Landing Page', 'Main landing page with call-to-action', 
'<div class="landing-page">
  <header class="hero-section">
    <div class="container">
      <h1>Transform Your Business Today</h1>
      <p>Join thousands of satisfied customers who have revolutionized their workflow</p>
      <form class="signup-form">
        <input type="email" name="email" placeholder="Enter your email" required>
        <button type="submit">Get Started Free</button>
      </form>
    </div>
  </header>
  <section class="features">
    <div class="container">
      <div class="feature">
        <h3>🚀 Fast Setup</h3>
        <p>Get started in minutes, not hours</p>
      </div>
      <div class="feature">
        <h3>💪 Powerful Tools</h3>
        <p>Everything you need in one platform</p>
      </div>
      <div class="feature">
        <h3>📈 Grow Your Business</h3>
        <p>Scale with confidence</p>
      </div>
    </div>
  </section>
</div>',
'.landing-page { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
.hero-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 20px; text-align: center; }
.container { max-width: 1200px; margin: 0 auto; }
.hero-section h1 { font-size: 3rem; margin-bottom: 20px; font-weight: 700; }
.hero-section p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
.signup-form { display: flex; gap: 10px; justify-content: center; max-width: 400px; margin: 0 auto; }
.signup-form input { flex: 1; padding: 15px; border: none; border-radius: 8px; font-size: 16px; }
.signup-form button { background: #ff6b6b; color: white; border: none; padding: 15px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.features { padding: 60px 20px; background: #f8f9fa; }
.features .container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
.feature { text-align: center; }
.feature h3 { font-size: 1.5rem; margin-bottom: 15px; }',
'', 
'["email"]', 
'landing', 
'system'),

-- Add sub pages for Contact
('contact_support', 'Support Contact', 'Customer support contact form', 
'<div class="contact-page">
  <div class="container">
    <h1>Get in Touch</h1>
    <p>We are here to help you with any questions or concerns</p>
    <form class="contact-form">
      <div class="form-row">
        <input type="text" name="first_name" placeholder="First Name" required>
        <input type="text" name="last_name" placeholder="Last Name" required>
      </div>
      <input type="email" name="email" placeholder="Email Address" required>
      <input type="text" name="subject" placeholder="Subject" required>
      <select name="category" required>
        <option value="">Select Category</option>
        <option value="support">Technical Support</option>
        <option value="billing">Billing Question</option>
        <option value="feature">Feature Request</option>
        <option value="other">Other</option>
      </select>
      <textarea name="message" rows="6" placeholder="Your message..." required></textarea>
      <button type="submit">Send Message</button>
    </form>
  </div>
</div>',
'.contact-page { padding: 40px 20px; font-family: Arial, sans-serif; background: #f0f4f8; min-height: 100vh; }
.container { max-width: 700px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.contact-page h1 { text-align: center; color: #2d3748; margin-bottom: 10px; }
.contact-page p { text-align: center; color: #718096; margin-bottom: 30px; }
.contact-form { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.contact-form input, .contact-form select, .contact-form textarea { padding: 15px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; transition: border-color 0.3s; }
.contact-form input:focus, .contact-form select:focus, .contact-form textarea:focus { outline: none; border-color: #4299e1; }
.contact-form button { background: #4299e1; color: white; border: none; padding: 15px; border-radius: 8px; font-size: 18px; cursor: pointer; transition: background 0.3s; }
.contact-form button:hover { background: #3182ce; }',
'', 
'["first_name", "last_name", "email", "subject", "category", "message"]', 
'contact', 
'system');
