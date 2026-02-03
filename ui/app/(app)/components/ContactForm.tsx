'use client'

import { useState, FormEvent } from 'react'

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        // Prevent double submission
        if (isSubmitting) return
        
        setIsSubmitting(true)
        setMessage(null)

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
                setMessage({ type: 'success', text: result.message })
                // Reset form
                ;(e.target as HTMLFormElement).reset()
                
                // Clear success message after 5 seconds
                setTimeout(() => setMessage(null), 5000)
            } else {
                setMessage({ 
                    type: 'error', 
                    text: result.error || 'Failed to submit. Please try again.' 
                })
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: 'Network error. Please check your connection and try again.' 
            })
        } finally {
            setIsSubmitting(false)
        }
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
            
            {message && (
                <div className={`sm:col-span-2 px-5 py-4 rounded-2xl ${
                    message.type === 'success' 
                        ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
                        : 'bg-red-500/20 border border-red-500/50 text-red-300'
                }`}>
                    {message.text}
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
