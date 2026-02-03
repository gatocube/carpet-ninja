'use client'

import { useState, FormEvent } from 'react'

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        // Prevent double submission
        if (isSubmitting || isSubmitted) return
        
        setIsSubmitting(true)
        setErrorMessage(null)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string || '',
            message: formData.get('message') as string,
            source: formData.get('source') as string || 'website',
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (response.ok) {
                // Hide form and show success message
                setIsSubmitted(true)
            } else {
                setErrorMessage(result.error || 'Failed to submit. Please try again.')
            }
        } catch (error) {
            setErrorMessage('Network error. Please check your connection and try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleNewRequest = () => {
        setIsSubmitted(false)
        setErrorMessage(null)
    }

    // Show success message instead of form
    if (isSubmitted) {
        return (
            <div className="sm:col-span-2 text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 mb-6">
                    <i className="fa-solid fa-check text-4xl text-green-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                    Thank You! 🎉
                </h3>
                <p className="text-white/70 mb-2">
                    Your message has been sent successfully!
                </p>
                <p className="text-white/50 text-sm mb-8">
                    We'll get back to you within 24 hours.
                </p>
                <button
                    onClick={handleNewRequest}
                    className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors text-sm"
                >
                    <i className="fa-solid fa-arrow-left"></i>
                    Submit another request
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input 
                required 
                name="name" 
                disabled={isSubmitting}
                className="bg-[#0a0a0f]/60 border border-white/10 rounded-2xl px-5 py-4 focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50" 
                placeholder="Full name" 
            />
            <input 
                name="phone" 
                disabled={isSubmitting}
                className="bg-[#0a0a0f]/60 border border-white/10 rounded-2xl px-5 py-4 focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50" 
                placeholder="Phone" 
            />
            <input 
                required 
                type="email" 
                name="email" 
                disabled={isSubmitting}
                className="bg-[#0a0a0f]/60 border border-white/10 rounded-2xl px-5 py-4 sm:col-span-2 focus:border-pink-500 focus:outline-none transition-colors disabled:opacity-50" 
                placeholder="Email" 
            />
            <textarea 
                required 
                name="message" 
                rows={5} 
                disabled={isSubmitting}
                className="bg-[#0a0a0f]/60 border border-white/10 rounded-2xl px-5 py-4 sm:col-span-2 focus:border-pink-500 focus:outline-none transition-colors resize-none disabled:opacity-50" 
                placeholder="How can we help?"
            ></textarea>
            <input type="hidden" name="source" value="website" />
            
            {errorMessage && (
                <div className="sm:col-span-2 px-5 py-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-300">
                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                    {errorMessage}
                </div>
            )}
            
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="sm:col-span-2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Sending...
                    </>
                ) : (
                    <>
                        Send Message <i className="fa-solid fa-paper-plane ml-2"></i>
                    </>
                )}
            </button>
        </form>
    )
}
