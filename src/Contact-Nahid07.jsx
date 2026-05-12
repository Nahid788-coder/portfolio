import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { useReveal, applyRipple } from './hooks';

function Contact() {
    const formRef = useRef();
    const leftRef = useReveal();
    const rightRef = useReveal();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            setStatus('Please fill in all required fields');
            return;
        }
        setIsLoading(true);
        setStatus('');
        try {
            await emailjs.sendForm('service_lucdhze', 'template_9mny4ae', formRef.current, '5kJmcw_Hx-5j8-FUA');
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch {
            setStatus('error');
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus(''), 5000);
        }
    };

    const contactInfo = [
        { icon: 'fa-envelope', label: 'Email', value: 'doiznahidhusain1234@gmail.com' },
        { icon: 'fa-location-dot', label: 'Location', value: 'Himatnagar, Gujarat' },
        { icon: 'fa-briefcase', label: 'Status', value: 'Open to opportunities' },
    ];

    return (
        <section className="contact" id="contact">
            <div className="contact-inner">
                <div className="contact-grid">
                    <div className="contact-left reveal-left" ref={leftRef}>
                        <div className="section-tag">
                            <i className="fa-solid fa-envelope"></i> Contact
                        </div>
                        <h2>
                            Let's Work<br /><span>Together</span>
                        </h2>
                        <p>
                            Have a project in mind or want to collaborate? I'm always open to
                            discussing new opportunities and interesting projects.
                        </p>

                        {contactInfo.map((item, i) => (
                            <div className="contact-info-item" key={i}>
                                <div className="contact-info-icon">
                                    <i className={`fa-solid ${item.icon}`}></i>
                                </div>
                                <div className="contact-info-text">
                                    <h5>{item.label}</h5>
                                    <p>{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="contact-form-wrap reveal-right" ref={rightRef}>
                        <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input type="email" name="email" placeholder="john@email.com" value={formData.email} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group full">
                                <label>Subject</label>
                                <input type="text" name="subject" placeholder="Project Discussion" value={formData.subject} onChange={handleChange} />
                            </div>
                            <div className="form-group full">
                                <label>Message *</label>
                                <textarea name="message" placeholder="Tell me about your project..." value={formData.message} onChange={handleChange} rows="6"></textarea>
                            </div>

                            {status && (
                                <p className={`form-status ${status === 'success' ? 'success' : 'error'}`}>
                                    {status === 'success'
                                        ? '✅ Message sent! I\'ll get back to you soon.'
                                        : '❌ Failed to send. Please try again.'}
                                </p>
                            )}

                            <button type="submit" className="submit-btn ripple" disabled={isLoading} onClick={applyRipple}>
                                {isLoading
                                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Sending...</>
                                    : <><i className="fa-solid fa-paper-plane"></i> Send Message</>
                                }
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Contact;
