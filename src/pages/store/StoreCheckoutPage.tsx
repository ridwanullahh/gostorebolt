import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, CreditCard, Truck, MapPin, 
  Lock, Check, Plus, Edit, Trash2, Gift,
  ArrowLeft, ArrowRight, Percent
} from 'lucide-react';
import StoreLayout from '../../components/store/StoreLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import StoreSDK, { Cart, Customer, DiscountCode } from '../../lib/store-sdk';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

const StoreCheckoutPage: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [billingForm, setBillingForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    sameAsShipping: true,
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    saveCard: false,
  });

  const storeSDK = new StoreSDK();

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setIsLoading(true);
      
      // Load cart
      const sessionId = getSessionId();
      const storeSlug = getStoreSlugFromUrl();
      if (!storeSlug) return;

      const store = await storeSDK.getStoreBySlug(storeSlug);
      if (!store) return;

      const cartData = await storeSDK.getCart(store.id, sessionId);
      setCart(cartData);

    } catch (error) {
      console.error('Error loading checkout data:', error);
      toast.error('Failed to load checkout data');
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionId = () => {
    return localStorage.getItem('sessionId') || crypto.randomUUID();
  };

  const getStoreSlugFromUrl = () => {
    const hostname = window.location.hostname;
    if (hostname !== 'gostore.top' && hostname !== 'localhost') {
      return hostname.split('.')[0];
    }
    return window.location.pathname.split('/')[1];
  };

  const handleApplyDiscount = async () => {
    if (!cart || !discountCode.trim()) return;

    try {
      const storeSlug = getStoreSlugFromUrl();
      if (!storeSlug) return;

      const store = await storeSDK.getStoreBySlug(storeSlug);
      if (!store) return;

      const validation = await storeSDK.validateDiscountCode(store.id, discountCode, cart.subtotal);
      
      if (validation.valid && validation.discount) {
        setAppliedDiscount(validation.discount);
        
        // Calculate discount amount
        let discountAmount = 0;
        if (validation.discount.type === 'percentage') {
          discountAmount = (cart.subtotal * validation.discount.value) / 100;
        } else if (validation.discount.type === 'fixed') {
          discountAmount = validation.discount.value;
        }

        // Update cart with discount
        const updatedCart = {
          ...cart,
          discount: discountAmount,
          total: cart.subtotal + cart.tax + cart.shipping - discountAmount,
          discountCodes: [discountCode]
        };
        
        setCart(updatedCart);
        toast.success('Discount code applied successfully!');
        setDiscountCode('');
      } else {
        toast.error(validation.error || 'Invalid discount code');
      }
    } catch (error) {
      toast.error('Failed to apply discount code');
    }
  };

  const handleRemoveDiscount = () => {
    if (!cart) return;

    const updatedCart = {
      ...cart,
      discount: 0,
      total: cart.subtotal + cart.tax + cart.shipping,
      discountCodes: []
    };
    
    setCart(updatedCart);
    setAppliedDiscount(null);
    toast.success('Discount code removed');
  };

  const handlePlaceOrder = async () => {
    if (!cart) return;

    try {
      const storeSlug = getStoreSlugFromUrl();
      if (!storeSlug) return;

      const store = await storeSDK.getStoreBySlug(storeSlug);
      if (!store) return;

      // Create order
      const order = await storeSDK.createOrder({
        storeId: store.id,
        customerId: customer?.id,
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        total: cart.total,
        currency: cart.currency,
        customer: {
          email: shippingForm.email,
          firstName: shippingForm.firstName,
          lastName: shippingForm.lastName,
          phone: shippingForm.phone,
        },
        shipping: shippingForm,
        billing: billingForm.sameAsShipping ? shippingForm : billingForm,
      });

      toast.success('Order placed successfully!');
      
      // Redirect to order confirmation
      window.location.href = `/order-confirmation/${order.orderNumber}`;
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    }
  };

  const steps = [
    { id: 1, name: 'Shipping', icon: Truck },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Review', icon: Check },
  ];

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <StoreLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some products to continue with checkout</p>
            <Button variant="primary" onClick={() => window.location.href = '/'}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-4 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <Card.Header>
                    <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
                  </Card.Header>
                  <Card.Content>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="First Name *"
                        value={shippingForm.firstName}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                      <Input
                        label="Last Name *"
                        value={shippingForm.lastName}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                      <Input
                        label="Email *"
                        type="email"
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="md:col-span-2"
                      />
                      <Input
                        label="Phone"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      <Input
                        label="Company"
                        value={shippingForm.company}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, company: e.target.value }))}
                      />
                      <Input
                        label="Address *"
                        value={shippingForm.address1}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, address1: e.target.value }))}
                        required
                        className="md:col-span-2"
                      />
                      <Input
                        label="Apartment, suite, etc."
                        value={shippingForm.address2}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, address2: e.target.value }))}
                        className="md:col-span-2"
                      />
                      <Input
                        label="City *"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                      <Input
                        label="State *"
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, state: e.target.value }))}
                        required
                      />
                      <Input
                        label="Postal Code *"
                        value={shippingForm.postalCode}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, postalCode: e.target.value }))}
                        required
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <select
                          value={shippingForm.country}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Billing Address */}
                <Card>
                  <Card.Header>
                    <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
                  </Card.Header>
                  <Card.Content>
                    <div className="mb-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={billingForm.sameAsShipping}
                          onChange={(e) => setBillingForm(prev => ({ ...prev, sameAsShipping: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">Same as shipping address</span>
                      </label>
                    </div>

                    {!billingForm.sameAsShipping && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="First Name *"
                          value={billingForm.firstName}
                          onChange={(e) => setBillingForm(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                        <Input
                          label="Last Name *"
                          value={billingForm.lastName}
                          onChange={(e) => setBillingForm(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                        {/* Add other billing fields similar to shipping */}
                      </div>
                    )}
                  </Card.Content>
                </Card>

                {/* Payment Method */}
                <Card>
                  <Card.Header>
                    <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Card Number *"
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                          placeholder="1234 5678 9012 3456"
                          required
                          className="md:col-span-2"
                        />
                        <Input
                          label="Expiry Date *"
                          value={paymentForm.expiryDate}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                          placeholder="MM/YY"
                          required
                        />
                        <Input
                          label="CVV *"
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                          placeholder="123"
                          required
                        />
                        <Input
                          label="Name on Card *"
                          value={paymentForm.nameOnCard}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, nameOnCard: e.target.value }))}
                          required
                          className="md:col-span-2"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={paymentForm.saveCard}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, saveCard: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">Save card for future purchases</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Lock className="h-4 w-4" />
                        <span>Your payment information is secure and encrypted</span>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card>
                  <Card.Header>
                    <h2 className="text-xl font-semibold text-gray-900">Review Your Order</h2>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-6">
                      {/* Shipping Info */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                        <div className="text-sm text-gray-600">
                          <p>{shippingForm.firstName} {shippingForm.lastName}</p>
                          <p>{shippingForm.address1}</p>
                          {shippingForm.address2 && <p>{shippingForm.address2}</p>}
                          <p>{shippingForm.city}, {shippingForm.state} {shippingForm.postalCode}</p>
                          <p>{shippingForm.country}</p>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                        <div className="text-sm text-gray-600">
                          <p>**** **** **** {paymentForm.cardNumber.slice(-4)}</p>
                          <p>{paymentForm.nameOnCard}</p>
                        </div>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < 3 ? (
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handlePlaceOrder}
                  size="lg"
                >
                  Place Order
                  <Lock className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <Card.Header>
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.productImage || '/api/placeholder/60/60'}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Discount Code */}
                  <div className="border-t border-gray-200 pt-4">
                    {appliedDiscount ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Gift className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            {appliedDiscount.code}
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveDiscount}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Discount code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={handleApplyDiscount}
                          disabled={!discountCode.trim()}
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">{formatCurrency(cart.subtotal)}</span>
                    </div>
                    
                    {cart.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount:</span>
                        <span className="text-green-600">-{formatCurrency(cart.discount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">
                        {cart.shipping > 0 ? formatCurrency(cart.shipping) : 'Free'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">{formatCurrency(cart.tax)}</span>
                    </div>
                    
                    <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(cart.total)}</span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-4 border-t border-gray-200">
                    <Lock className="h-4 w-4" />
                    <span>Secure checkout powered by SSL encryption</span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default StoreCheckoutPage;