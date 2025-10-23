# Frequently Asked Questions (FAQ)

## General Questions

### What is the Mint Platform?

The Mint Platform is a comprehensive payment facilitation system that enables businesses to manage POS terminals, process payments, and handle payouts through Paystack integration. It serves as a remittance company that facilitates payments for merchants while providing detailed analytics and payout management.

### Who can use the Mint Platform?

The Mint Platform is designed for:

- **Merchants**: Businesses that need to accept payments via POS terminals
- **Individuals**: Personal users who need to manage payments
- **Administrators**: System administrators who manage the platform

### What are the main features of the Mint Platform?

Key features include:

- Multi-tenant architecture with role-based access control
- POS terminal management and monitoring
- Invoice creation and payment processing
- Real-time analytics and reporting
- Flexible payout management
- Dynamic fee calculation
- Comprehensive audit logging

### How does the Mint Platform integrate with Paystack?

The platform integrates with Paystack Terminal API to:

- Create and manage POS terminals
- Process invoice payments
- Handle real-time payment updates via webhooks
- Manage customer data and payment requests

## Account and Registration

### How do I create an account?

1. Visit the Mint Platform registration page
2. Choose your account type (Merchant or Individual)
3. Fill in the required information
4. Verify your email address
5. Complete your profile setup

### What information do I need to provide during registration?

**For Merchants:**

- Business name and type
- Contact information (email, phone)
- Business address
- User details (name, email, password)

**For Individuals:**

- Personal information (name, email, phone)
- Address details
- User credentials (email, password)

### Can I change my account type after registration?

Account type changes require administrative approval. Contact support to request a change from Individual to Merchant or vice versa.

### What if I forget my password?

1. Go to the login page
2. Click "Forgot Password"
3. Enter your email address
4. Check your email for password reset instructions
5. Follow the link to create a new password

### How do I verify my email address?

1. Check your email inbox for a verification message
2. Click the verification link in the email
3. If you don't see the email, check your spam folder
4. Contact support if you need the verification email resent

## Invoices and Payments

### How do I create an invoice?

1. Navigate to the Invoices section
2. Click "Create Invoice"
3. Fill in customer information
4. Enter invoice details (amount, description, due date)
5. Select a terminal (if applicable)
6. Review and create the invoice

### What information do I need to create an invoice?

Required information:

- Customer email address
- Invoice amount
- Description of goods/services
- Due date (optional)

Optional information:

- Customer name and phone number
- Payment category
- Specific terminal assignment

### How do customers pay invoices?

Customers can pay invoices through:

- POS terminals (card payments)
- Mobile money
- Bank transfers
- Other Paystack-supported payment methods

### Can I edit or cancel an invoice?

- **Edit**: You can edit unpaid invoices
- **Cancel**: You can cancel unpaid invoices
- **Paid invoices**: Cannot be edited or cancelled

### How do I track invoice payments?

- View invoice status in the Invoices section
- Check payment history in the Payments section
- Monitor real-time updates in the Dashboard
- Receive email notifications for payment updates

### What happens if a payment fails?

- The invoice status remains "Pending"
- You can retry the payment
- Check terminal connectivity and status
- Contact support if issues persist

## Terminal Management

### How do I add a new terminal?

1. Go to the Terminals section
2. Click "Add Terminal"
3. Enter terminal information (serial number, model, location)
4. Assign to an outlet
5. Configure terminal settings

### What information do I need for terminal setup?

Required information:

- Terminal serial number
- Terminal model
- Outlet assignment
- Physical location description

### How do I monitor terminal status?

- View terminal status in the Terminals section
- Check real-time status updates
- Monitor battery level and connectivity
- Review terminal activity logs

### What do different terminal statuses mean?

- **Active**: Terminal is operational and ready for payments
- **Inactive**: Terminal is offline or not responding
- **Maintenance**: Terminal is under maintenance
- **Replaced**: Terminal has been replaced
- **Lost**: Terminal has been reported lost

### How do I troubleshoot terminal issues?

1. Check terminal connectivity
2. Verify terminal status
3. Restart the terminal
4. Check network connection
5. Contact support if issues persist

### Can I move terminals between outlets?

Yes, you can reassign terminals to different outlets through the terminal management interface.

## Analytics and Reporting

### What analytics are available?

The platform provides:

- Revenue trends and growth metrics
- Transaction volume and success rates
- Top performing outlets and categories
- Payment method analytics
- Terminal performance metrics
- Customer behavior insights

### How do I generate reports?

1. Navigate to the Analytics section
2. Choose report type and parameters
3. Select date range and filters
4. Generate and download reports
5. Schedule automated reports (optional)

### Can I customize reports?

Yes, you can:

- Select specific date ranges
- Filter by outlets, categories, or payment methods
- Choose report format (PDF, Excel, CSV)
- Schedule automated report delivery

### How often are analytics updated?

- Real-time metrics: Updated immediately
- Daily reports: Updated once per day
- Historical data: Available for analysis
- Custom reports: Generated on demand

## Payouts and Settlements

### How do I set up payouts?

1. Go to the Payouts section
2. Add payout methods (bank account, mobile money)
3. Configure payout preferences
4. Set payout frequency (daily, weekly, monthly)
5. Verify payout methods

### What payout methods are supported?

Supported payout methods:

- Bank account transfers
- Mobile money
- Digital wallets
- Other supported payment methods

### How do I track payout status?

- View payout history in the Payouts section
- Check payout status updates
- Monitor payout processing
- Receive payout notifications

### What are the payout fees?

Payout fees vary by:

- Payout method
- Payout amount
- Payout frequency
- Merchant tier

Contact support for specific fee information.

### How long do payouts take to process?

Processing times vary by payout method:

- Bank transfers: 1-3 business days
- Mobile money: Instant to 24 hours
- Digital wallets: Instant to 1 hour

### Can I change my payout method?

Yes, you can:

- Add new payout methods
- Update existing payout methods
- Set default payout methods
- Remove unused payout methods

## Fees and Charges

### How are fees calculated?

Fees are calculated based on:

- Invoice amount
- Merchant tier
- Payment category
- Fee structure configuration

### What fee structures are available?

Available fee structures:

- Basic tier: 3.5% fee
- Standard tier: 2.5% fee
- Premium tier: 1.5% fee
- Enterprise tier: 1.0% fee

### Can I negotiate custom fees?

Custom fee structures are available for enterprise merchants. Contact support to discuss custom pricing.

### How do I view my fee history?

- Check fee breakdown in invoice details
- View fee history in the Analytics section
- Download fee reports
- Monitor fee trends over time

## Security and Privacy

### How is my data protected?

The platform implements:

- SSL/TLS encryption for data transmission
- Encrypted data storage
- Role-based access control
- Regular security audits
- Compliance with data protection regulations

### Who can access my data?

Access is controlled through:

- Role-based permissions
- User authentication
- Audit logging
- Data access controls

### How do I manage user permissions?

1. Go to Settings > Team Management
2. Add or remove team members
3. Assign roles and permissions
4. Configure access levels
5. Monitor user activity

### What security measures are in place?

Security measures include:

- Multi-factor authentication
- Password policies
- Session management
- Input validation
- SQL injection prevention
- XSS protection

## Technical Support

### How do I contact support?

You can contact support through:

- Email: support@mintplatform.com
- Live chat on the platform
- Phone support
- Support ticket system

### What information should I include in support requests?

Include:

- Detailed description of the issue
- Steps to reproduce the problem
- Screenshots or error messages
- Account information
- Browser and device details

### How quickly will I receive support?

Response times:

- Critical issues: Within 1 hour
- High priority: Within 4 hours
- Standard issues: Within 24 hours
- General inquiries: Within 48 hours

### Is there a knowledge base or documentation?

Yes, the platform provides:

- Comprehensive user manual
- Video tutorials
- FAQ section
- API documentation
- Best practices guide

## Integration and API

### Is there an API available?

Yes, the platform provides a comprehensive REST API for:

- Invoice management
- Payment processing
- Terminal management
- Analytics and reporting
- User management

### How do I access the API?

1. Contact support to request API access
2. Receive API credentials
3. Review API documentation
4. Implement API integration
5. Test in sandbox environment

### What programming languages are supported?

The API supports any language that can make HTTP requests, including:

- JavaScript/Node.js
- Python
- PHP
- Java
- C#
- Ruby
- Go

### Is there a sandbox environment for testing?

Yes, a sandbox environment is available for:

- API testing
- Integration development
- Payment testing
- Terminal testing

## Mobile Access

### Is there a mobile app?

The platform is optimized for mobile browsers and provides:

- Responsive web design
- Mobile-optimized interface
- Touch-friendly controls
- Offline functionality (limited)

### Can I access the platform on mobile devices?

Yes, the platform is fully accessible on:

- Smartphones
- Tablets
- Mobile browsers
- Progressive Web App (PWA)

### What mobile features are available?

Mobile features include:

- Dashboard access
- Invoice creation
- Terminal monitoring
- Payment tracking
- Analytics viewing
- Push notifications

## Billing and Subscriptions

### How is the platform billed?

Billing options include:

- Transaction-based fees
- Monthly subscriptions
- Enterprise pricing
- Custom pricing plans

### What payment methods are accepted for billing?

Accepted payment methods:

- Credit/debit cards
- Bank transfers
- Mobile money
- Digital wallets

### Can I change my billing plan?

Yes, you can:

- Upgrade or downgrade plans
- Change billing frequency
- Update payment methods
- Request custom pricing

### How do I view my billing history?

- Check billing history in Settings
- Download billing statements
- View transaction fees
- Monitor subscription status

## Linked External Resources

- [Paystack Documentation](https://paystack.com/docs/)
- [Paystack Terminal API](https://paystack.com/docs/terminal/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Material UI Documentation](https://mui.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

This FAQ provides answers to common questions about the Mint Platform. If you have additional questions not covered here, please contact support for assistance.
