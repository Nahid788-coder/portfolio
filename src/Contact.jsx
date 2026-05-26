import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { useReveal, applyRipple } from './hooks';
import { useLanguage } from './context/LanguageContext';

function Contact() {
    const formRef = useRef();
    const leftRef = useReveal();
    const rightRef = useReveal();
    const { t } = useLanguage();
    const c = t.contact;
    const f = c.form;

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
            setStatus('validation');
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

    return (
        <section className="contact" id="contact">
            <div className="contact-inner">
                <div className="contact-grid">
                    <div className="contact-left reveal-left" ref={leftRef}>
                        <div className="section-tag">
                            <i className="fa-solid fa-envelope"></i> {c.tag}
                        </div>
                        <h2>
                            {c.titleLine1}<br /><span>{c.titleSpan}</span>
                        </h2>
                        <p>{c.para}</p>

                        {c.info.map((item, i) => (
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
                                    <label>{f.nameLbl}</label>
                                    <input type="text" name="name" placeholder={f.namePh} value={formData.name} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>{f.emailLbl}</label>
                                    <input type="email" name="email" placeholder={f.emailPh} value={formData.email} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group full">
                                <label>{f.subjectLbl}</label>
                                <input type="text" name="subject" placeholder={f.subjectPh} value={formData.subject} onChange={handleChange} />
                            </div>
                            <div className="form-group full">
                                <label>{f.messageLbl}</label>
                                <textarea name="message" placeholder={f.messagePh} value={formData.message} onChange={handleChange} rows="6"></textarea>
                            </div>

                            {status && (
                                <p className={`form-status ${status === 'success' ? 'success' : 'error'}`}>
                                    {status === 'success' ? f.success
                                     : status === 'validation' ? f.validation
                                     : f.error}
                                </p>
                            )}

                            <button type="submit" className="submit-btn ripple" disabled={isLoading} onClick={applyRipple}>
                                {isLoading
                                    ? <><i className="fa-solid fa-spinner fa-spin"></i> {f.sending}</>
                                    : <><i className="fa-solid fa-paper-plane"></i> {f.sendBtn}</>
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
