import { getServices, getReviews, getPricing, getSiteSettings, getHero, getBeforeAfter, getSectionVisibility } from '@/lib/payload'
import { ContactForm } from './components/ContactForm'

// Enable dynamic rendering - content updates immediately when edited in admin
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
    const [services, reviews, pricing, settings, hero, beforeAfter, visibility] = await Promise.all([
        getServices(),
        getReviews(),
        getPricing(),
        getSiteSettings(),
        getHero(),
        getBeforeAfter(),
        getSectionVisibility(),
    ])

    return (
        <main>
            {/* Header */}
            <header className="fixed w-full top-0 z-50 bg-[#1a1b26]/70 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <a href="#home" className="flex items-center gap-3 group">
                        <img src="/carpet-ninja.png" alt="Carpet Ninja logo" className="w-11 h-11 transition-transform group-hover:scale-110" />
                        <span className="font-black tracking-tight text-xl">Carpet <span className="bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">Ninja</span></span>
                    </a>
                    <nav className="hidden md:flex gap-8 text-sm font-medium">
                        <a href="#services" className="hover:text-pink-500 transition-colors">Services</a>
                        <a href="#reviews" className="hover:text-pink-500 transition-colors">Reviews</a>
                        <a href="#pricing" className="hover:text-pink-500 transition-colors">Pricing</a>
                        <a href="#coverage" className="hover:text-pink-500 transition-colors">Service Area</a>
                        <a href="#contact" className="hover:text-pink-500 transition-colors">Contact</a>
                    </nav>
                    <a href="#contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all">
                        <i className="fa-solid fa-broom"></i><span className="hidden sm:inline">Get a Free Quote</span>
                    </a>
                </div>
            </header>

            {/* Hero Section */}
            {visibility?.showHero !== false && (
            <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a0a0f] via-pink-500/10 to-indigo-500/5"></div>
                
                {/* Floating Bubbles Animation */}
                {visibility?.enableBubbles && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        {[
                            { left: '10%', top: '20%', size: 40, anim: 'float-1' },
                            { left: '20%', top: '60%', size: 65, anim: 'float-2' },
                            { left: '30%', top: '10%', size: 30, anim: 'float-3' },
                            { left: '40%', top: '80%', size: 55, anim: 'float-4' },
                            { left: '50%', top: '30%', size: 75, anim: 'float-5' },
                            { left: '60%', top: '70%', size: 45, anim: 'float-6' },
                            { left: '70%', top: '15%', size: 60, anim: 'float-7' },
                            { left: '80%', top: '50%', size: 35, anim: 'float-8' },
                            { left: '90%', top: '25%', size: 70, anim: 'float-9' },
                            { left: '15%', top: '85%', size: 40, anim: 'float-10' },
                            { left: '25%', top: '40%', size: 50, anim: 'float-11' },
                            { left: '35%', top: '5%', size: 65, anim: 'float-12' },
                        ].slice(0, Math.min(visibility.bubbleCount || 12, 12)).map((bubble, i) => (
                            <div
                                key={i}
                                className="bubble"
                                style={{
                                    width: `${bubble.size}px`,
                                    height: `${bubble.size}px`,
                                    left: bubble.left,
                                    top: bubble.top,
                                    animation: `${bubble.anim} 25s ease-in-out infinite`,
                                }}
                            />
                        ))}
                    </div>
                )}
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 grid lg:grid-cols-2 items-center gap-12 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-[#1a1b26]/80 border border-white/10 rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-sm text-white/80">Now serving Bay Area</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                            {hero.headline?.includes(',') ? (
                                <>
                                    {hero.headline?.split(',')[0]},<br />
                                    <span className="bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">
                                        {hero.headline?.split(',')[1]}
                                    </span>
                                </>
                            ) : (
                                <span className="bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">
                                    {hero.headline}
                                </span>
                            )}
                        </h1>
                        <p className="mt-6 text-white/70 text-lg leading-relaxed max-w-xl">
                            {hero.subheadline}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <a href="#contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-all">
                                <i className="fa-solid fa-calendar-check"></i> {hero.ctaText || 'Book Now'}
                            </a>
                            <a href="#services" className="inline-flex items-center gap-2 border border-indigo-500/50 text-white px-8 py-4 rounded-full hover:bg-indigo-500/10 transition-all">
                                <i className="fa-solid fa-play"></i> See Services
                            </a>
                        </div>
                        <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/60">
                            {hero.badges?.map((badge: { icon?: string; text: string }, idx: number) => (
                                <span key={idx} className="inline-flex items-center gap-2">
                                    <i className={badge.icon || 'fa-solid fa-check'}></i> {badge.text}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 blur-3xl"></div>
                            <img src="/carpet-ninja-car-3.png" alt="Carpet Ninja Van" className="relative w-full h-auto" style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))' }} />
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* Trust Bar */}
            <section className="py-8 border-y border-white/5 bg-[#1a1b26]/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-y-4 gap-x-8 justify-center lg:justify-between text-white/70 text-sm">
                    <div className="flex items-center gap-3"><i className="fa-solid fa-spray-can-sparkles text-pink-500"></i> Truck-mount grade extractors</div>
                    <div className="flex items-center gap-3"><i className="fa-solid fa-droplet text-indigo-500"></i> Eco detergents & anti-allergen rinse</div>
                    <div className="flex items-center gap-3"><i className="fa-solid fa-stopwatch text-cyan-400"></i> Fast drying</div>
                    <div className="flex items-center gap-3"><i className="fa-solid fa-shield-halved text-pink-500"></i> Satisfaction guarantee</div>
                </div>
            </section>

            {/* Services Section */}
            {visibility?.showServices !== false && (
            <section id="services" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block text-pink-500 text-sm font-semibold tracking-wider uppercase mb-4">What We Offer</span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">Our <span className="bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">Services</span></h2>
                        <p className="text-white/60 mt-4">Professional equipment • Trained techs • Pet-safe solutions</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {services.map((service: any, idx) => {
                            const imageUrl = service.image?.url || `/service-${service.slug === 'deep-carpet-cleaning' ? 'deep-carpet-cleaning' : service.slug === 'upholstery-mattresses' ? 'upholstery-mattreses' : 'stain-order-removal'}.png`
                            return (
                            <div key={service.id} className="group bg-[#1a1b26]/70 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-lg hover:shadow-pink-500/20 transition-all hover:-translate-y-2">
                                <div className="relative overflow-hidden">
                                    <img src={imageUrl} alt={service.title} className="w-full h-56 object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 to-transparent"></div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-xl mb-3">{service.title}</h3>
                                    <p className="text-white/60 leading-relaxed">{service.description}</p>
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            </section>
            )}

            {/* Before/After Section */}
            {visibility?.showBeforeAfter !== false && beforeAfter?.comparisons && beforeAfter.comparisons.length > 0 && (
            <section id="before-after" className="py-24 bg-[#1a1b26]/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block text-indigo-500 text-sm font-semibold tracking-wider uppercase mb-4">Real Results</span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                            {beforeAfter.sectionTitle || 'See the'} <span className="bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">Difference</span>
                        </h2>
                        <p className="text-white/60 mt-4">{beforeAfter.sectionSubtitle || 'Real results from Bay Area homes'}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {beforeAfter.comparisons.map((comp: any, idx: number) => (
                            <div key={idx} className="group bg-[#1a1b26]/70 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition-all hover:-translate-y-2">
                                <div className="relative overflow-hidden">
                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="relative">
                                            <img src={comp.beforeImage?.url || '/before.png'} alt={`${comp.title} - Before`} className="w-full h-56 object-cover" />
                                            <div className="absolute bottom-2 left-2 bg-[#0a0a0f]/80 px-3 py-1 rounded-full text-xs font-semibold">Before</div>
                                        </div>
                                        <div className="relative">
                                            <img src={comp.afterImage?.url || '/after.png'} alt={`${comp.title} - After`} className="w-full h-56 object-cover" />
                                            <div className="absolute bottom-2 right-2 bg-gradient-to-r from-pink-500 to-indigo-500 px-3 py-1 rounded-full text-xs font-semibold">After</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-xl mb-2">{comp.title}</h3>
                                    {comp.description && <p className="text-white/60 text-sm leading-relaxed">{comp.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* Reviews Section */}
            {visibility?.showReviews !== false && (
            <section id="reviews" className="py-24 bg-[#1a1b26]/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block text-pink-500 text-sm font-semibold tracking-wider uppercase mb-4">Testimonials</span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">Customer <span className="bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">Reviews</span></h2>
                        <p className="text-white/60 mt-4">Rated 4.9 out of 5 by Bay Area homeowners</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-[#1a1b26]/70 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-lg">
                                <div className="flex items-center gap-1 text-pink-500 mb-4">
                                    {[...Array(review.rating)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                                </div>
                                <p className="text-white/80 leading-relaxed italic">"{review.text}"</p>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 flex items-center justify-center font-bold">{review.name[0]}</div>
                                    <div>
                                        <div className="font-medium">{review.name}</div>
                                        <div className="text-sm text-white/50">{review.location}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* Pricing Section */}
            {visibility?.showPricing !== false && (
            <section id="pricing" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block text-pink-500 text-sm font-semibold tracking-wider uppercase mb-4">Simple Pricing</span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">Transparent <span className="bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">Pricing</span></h2>
                        <p className="text-white/60 mt-4">No hidden fees • No surprises • Just honest, upfront pricing</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {pricing.map((tier) => (
                            <div key={tier.id} className={`relative bg-[#1a1b26]/70 backdrop-blur-xl rounded-3xl p-8 shadow-lg ${tier.popular ? 'border-2 border-pink-500 shadow-pink-500/20' : 'border border-white/5'}`}>
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg">Most Popular</span>
                                    </div>
                                )}
                                <div className="text-center pt-4">
                                    <h3 className="text-xl font-bold mb-3">{tier.title}</h3>
                                    <div className="text-5xl font-black bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent mb-2">${tier.price}</div>
                                    <p className="text-white/50 text-sm">{tier.rooms}</p>
                                </div>
                                <ul className="mt-8 space-y-4 text-white/80">
                                    {tier.features?.map((f: { feature: string }, idx: number) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-6 h-6 bg-pink-500/20 rounded-full text-xs">
                                                <i className="fa-solid fa-check text-pink-500"></i>
                                            </span>
                                            {f.feature}
                                        </li>
                                    ))}
                                </ul>
                                <a href="#contact" className={`block w-full mt-8 text-center font-semibold py-4 rounded-full transition-all ${tier.popular ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white' : 'bg-[#1a1b26] border border-indigo-500/50 text-white hover:bg-indigo-500/20'}`}>
                                    Get Quote
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* Coverage Section */}
            {visibility?.showCoverage !== false && (
            <section id="coverage" className="py-24 bg-[#1a1b26]/40 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block text-indigo-500 text-sm font-semibold tracking-wider uppercase mb-4">Coverage Area</span>
                            <h2 className="text-3xl sm:text-4xl font-black">We Serve the <span className="bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">Bay Area</span></h2>
                            <p className="mt-4 text-white/60 leading-relaxed">Mobile service that comes to you: San Francisco • Peninsula • South Bay • East Bay • North Bay.</p>
                            <ul className="mt-6 grid grid-cols-2 gap-3 text-white/80">
                                {settings.cities?.map((city: { name: string }, idx: number) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <i className="fa-solid fa-location-dot text-pink-500"></i> {city.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <iframe
                                title="Bay Area Map"
                                className="w-full h-[400px]"
                                loading="lazy"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253749.89588270477!2d-122.67501791888054!3d37.75781499767964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7e2a7f2a2a4d%3A0x31d05b0f6e5c1d2!2sSan%20Francisco%20Bay%20Area!5e0!3m2!1sen!2sus!4v1716944550000">
                            </iframe>
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* Contact Section */}
            {visibility?.showContact !== false && (
            <section id="contact" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <span className="inline-block text-pink-500 text-sm font-semibold tracking-wider uppercase mb-4">Get In Touch</span>
                            <h2 className="text-3xl sm:text-4xl font-black">Get Your <span className="bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">Free Quote</span></h2>
                            <p className="mt-4 text-white/60 leading-relaxed">Prefer texting? 📱 DM us your address and a couple of photos — we'll estimate right away.</p>
                            <div className="mt-8 space-y-4">
                                <a href={`tel:${settings.phone}`} className="flex items-center gap-4 text-white/80 hover:text-pink-500 transition-colors">
                                    <span className="flex items-center justify-center w-12 h-12 bg-indigo-500/20 rounded-2xl">
                                        <i className="fa-solid fa-phone text-indigo-500"></i>
                                    </span>
                                    <span className="text-lg">{settings.phone}</span>
                                </a>
                                <a href={`mailto:${settings.email}`} className="flex items-center gap-4 text-white/80 hover:text-pink-500 transition-colors">
                                    <span className="flex items-center justify-center w-12 h-12 bg-pink-500/20 rounded-2xl">
                                        <i className="fa-solid fa-envelope text-pink-500"></i>
                                    </span>
                                    <span className="text-lg">{settings.email}</span>
                                </a>
                                <a href="#" className="flex items-center gap-4 text-white/80 hover:text-pink-500 transition-colors">
                                    <span className="flex items-center justify-center w-12 h-12 bg-cyan-400/20 rounded-2xl">
                                        <i className="fa-brands fa-instagram text-cyan-400"></i>
                                    </span>
                                    <span className="text-lg">{settings.instagram}</span>
                                </a>
                            </div>
                        </div>
                        <div className="bg-[#1a1b26]/70 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#0a0a0f]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <img src="/carpet-ninja.png" alt="Carpet Ninja logo" className="w-10 h-10" />
                            <span className="text-white/60">© {new Date().getFullYear()} Carpet Ninja. All rights reserved.</span>
                        </div>
                        <div className="flex items-center gap-8 text-sm text-white/60">
                            <a href="#" className="hover:text-pink-500 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-pink-500 transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    )
}
