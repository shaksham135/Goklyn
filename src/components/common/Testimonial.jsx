import React, { useState, useEffect } from 'react';
import api from '../../api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Testimonial = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await api.get('/testimonials');
                setTestimonials(response.data);
                setError('');
            } catch (err) {
                console.error('Error fetching testimonials:', err);
                setError('Failed to load testimonials. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    const settings = {
        dots: true,
        infinite: testimonials.length > 1,
        speed: 500,
        slidesToShow: Math.min(testimonials.length, 2),
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(testimonials.length, 2),
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    const renderRating = (rating) => {
        return (
            <div className="testimonial-rating mb-2">
                {[...Array(5)].map((_, i) => (
                    <span 
                        key={i} 
                        className={`star ${i < (rating || 5) ? 'text-warning' : 'text-muted'}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <section className="py-5 bg-light">
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-5 bg-light">
                <div className="container text-center text-danger py-5">
                    {error}
                </div>
            </section>
        );
    }

    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="fw-bold">What Our Clients Say</h2>
                    <div className="divider mx-auto my-3 bg-primary"></div>
                    <p className="lead text-muted">Hear from people who have worked with us</p>
                </div>

                {testimonials.length > 0 ? (
                    <Slider {...settings} className="testimonial-slider">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial._id} className="px-3">
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4">
                                        <div className="mb-3">
                                            {renderRating(testimonial.rating)}
                                        </div>
                                        <blockquote className="blockquote mb-4">
                                            <p className="fst-italic">"{testimonial.feedback}"</p>
                                        </blockquote>
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0">
                                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                                                    {testimonial.clientName?.charAt(0) || 'U'}
                                                </div>
                                            </div>
                                            <div className="ms-3">
                                                <h6 className="mb-0">{testimonial.clientName || 'Anonymous'}</h6>
                                                {testimonial.company && (
                                                    <small className="text-muted">{testimonial.company}</small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <div className="text-center py-5">
                        <p className="text-muted">No testimonials available yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonial;
