# PCI DSS Considerations

## Scope

Perionyx does not directly process, store, or transmit credit card data. However, if integrated with payment processors, the following PCI DSS requirements must be considered:

## Requirements

### Build and Maintain a Secure Network
- [x] Firewall configuration
- [x] Secure system passwords
- [x] Network segmentation

### Protect Cardholder Data
- [ ] Encrypt cardholder data at rest
- [ ] Encrypt cardholder data in transit
- [ ] Do not store sensitive auth data

### Maintain Vulnerability Management
- [x] Anti-malware solutions
- [x] Secure application development
- [x] Regular security testing

### Implement Strong Access Control
- [x] Need-to-know access
- [x] Unique user IDs
- [x] Physical security

### Regularly Monitor and Test Networks
- [x] Audit logging
- [x] File integrity monitoring
- [x] Penetration testing

### Maintain Security Policy
- [x] Information security policy
- [x] Risk assessment
- [x] Incident response plan

## Key Requirement: Tokenization

If payment data flows through the system:
- Use tokenization (never store PAN)
- Use iframe-based payment forms (SAQ A)
- Implement 3D Secure for card-not-present transactions
