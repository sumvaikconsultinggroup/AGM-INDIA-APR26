"use client"

import { useEffect, useRef } from "react"
import { Shield, Eye, Lock, Users, Globe, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  const parallaxRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrollPosition = window.scrollY
        parallaxRef.current.style.transform = `translateY(${scrollPosition * 0.3}px)`
        parallaxRef.current.style.opacity = 1 - scrollPosition * 0.001
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <Eye className="text-[#B82A1E]" size={24} />,
      content: [
        {
          subtitle: "Personal Information",
          text: "We may collect personal information that you voluntarily provide to us when you register for our services, subscribe to our newsletter, participate in activities on our website, contact us, or otherwise interact with us. This may include:",
          list: [
            "Name and contact information (email address, phone number, mailing address)",
            "Demographic information (age, gender, location)",
            "Religious or spiritual preferences and interests",
            "Donation and payment information",
            "Communication preferences",
            "Event registration details",
            "Feedback and survey responses"
          ]
        },
        {
          subtitle: "Automatically Collected Information",
          text: "When you visit our website, we may automatically collect certain information about your device and usage patterns:",
          list: [
            "IP address and location data",
            "Browser type and version",
            "Operating system",
            "Pages visited and time spent on our site",
            "Referring website addresses",
            "Cookies and similar tracking technologies"
          ]
        }
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: <Users className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "We use the information we collect for various purposes, including:",
          list: [
            "Providing and maintaining our spiritual services and programs",
            "Processing donations and managing financial transactions",
            "Communicating with you about our activities, events, and teachings",
            "Sending newsletters and spiritual content you've subscribed to",
            "Responding to your inquiries and providing customer support",
            "Personalizing your experience on our website",
            "Analyzing website usage to improve our services",
            "Complying with legal obligations and protecting our rights",
            "Preventing fraud and ensuring security"
          ]
        }
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      icon: <Globe className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "We respect your privacy and do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:",
          list: [
            "With your explicit consent",
            "With trusted service providers who assist us in operating our website and conducting our mission",
            "When required by law or to comply with legal processes",
            "To protect our rights, property, or safety, or that of our users",
            "In connection with a merger, acquisition, or sale of assets (with prior notice)",
            "With other spiritual organizations for collaborative programs (with your consent)"
          ]
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:",
          list: [
            "Encryption of sensitive data during transmission and storage",
            "Regular security assessments and updates",
            "Access controls and authentication procedures",
            "Secure payment processing systems",
            "Regular backup and recovery procedures",
            "Staff training on data protection practices"
          ]
        },
        {
          text: "However, please note that no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security."
        }
      ]
    },
    {
      id: "cookies",
      title: "Cookies and Tracking Technologies",
      icon: <Shield className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "We use cookies and similar tracking technologies to enhance your browsing experience and analyze website traffic. Types of cookies we use include:",
          list: [
            "Essential cookies: Required for basic website functionality",
            "Analytics cookies: Help us understand how visitors use our site",
            "Preference cookies: Remember your settings and preferences",
            "Marketing cookies: Used to deliver relevant content and advertisements"
          ]
        },
        {
          text: "You can control cookie settings through your browser preferences. However, disabling certain cookies may affect website functionality."
        }
      ]
    },
    {
      id: "your-rights",
      title: "Your Privacy Rights",
      icon: <Users className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "Depending on your location, you may have certain rights regarding your personal information:",
          list: [
            "Right to access: Request copies of your personal information",
            "Right to rectification: Request correction of inaccurate information",
            "Right to erasure: Request deletion of your personal information",
            "Right to restrict processing: Limit how we use your information",
            "Right to data portability: Receive your data in a structured format",
            "Right to object: Object to certain types of processing",
            "Right to withdraw consent: Withdraw consent for data processing"
          ]
        },
        {
          text: "To exercise these rights, please contact us using the information provided below. We will respond to your request within a reasonable timeframe."
        }
      ]
    },
    {
      id: "children-privacy",
      title: "Children's Privacy",
      icon: <Shield className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "Our services are not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly."
        },
        {
          text: "If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately."
        }
      ]
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      icon: <Globe className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "As a spiritual organization with a global community, your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information."
        }
      ]
    },
    {
      id: "retention",
      title: "Data Retention",
      icon: <Lock className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Factors we consider when determining retention periods include:",
          list: [
            "The nature and sensitivity of the information",
            "Legal and regulatory requirements",
            "The purposes for which we collected the information",
            "Whether you have requested deletion of your information"
          ]
        }
      ]
    },
    {
      id: "third-party-links",
      title: "Third-Party Links",
      icon: <Globe className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit."
        }
      ]
    },
    {
      id: "updates",
      title: "Policy Updates",
      icon: <Shield className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our website and updating the 'Last Updated' date. Your continued use of our services after such changes constitutes acceptance of the updated policy."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f5] to-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden flex items-center justify-center">
        <div
          ref={parallaxRef}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/placeholder.svg?height=800&width=1920&text=Privacy+Policy')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-[#7B0000] z-10"></div>
        
        <div className="relative z-20 text-center text-white px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-white/10 backdrop-blur-sm">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Privacy Policy</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            Protecting Your Sacred Trust
          </p>
          <div className="mt-8 inline-block">
            <div className="h-0.5 w-20 bg-white/70 mx-auto"></div>
            <div className="h-0.5 w-12 bg-white/50 mx-auto mt-1"></div>
            <div className="h-0.5 w-6 bg-white/30 mx-auto mt-1"></div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-white/20 text-6xl font-serif z-10">ॐ</div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-8">
        <a
          href="/" 
          className="inline-flex items-center text-[#B82A1E] hover:text-[#8a1f16] transition-colors duration-300 mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </a>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#B82A1E]/10 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-[#5D4037] mb-4">Our Commitment to Your Privacy</h2>
              <p className="text-[#5D4037]/80 leading-relaxed">
                At our spiritual center, we hold your trust as sacred. This Privacy Policy explains how we collect, use, 
                protect, and share your personal information when you visit our website or engage with our services.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Secure</h3>
                <p className="text-sm text-[#5D4037]/70">Your data is protected with industry-standard security measures</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Transparent</h3>
                <p className="text-sm text-[#5D4037]/70">We clearly explain what information we collect and why</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Respectful</h3>
                <p className="text-sm text-[#5D4037]/70">Your privacy rights are honored and protected</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-[#B82A1E]/5 rounded-lg">
              <p className="text-sm text-[#5D4037]/80">
                <strong>Last Updated:</strong> January 15, 2024<br />
                <strong>Effective Date:</strong> January 15, 2024
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#B82A1E]/10 mb-12">
            <h3 className="text-2xl font-serif text-[#5D4037] mb-6">Table of Contents</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-[#B82A1E]/5 transition-colors duration-300 group"
                >
                  <div className="mr-3">{section.icon}</div>
                  <span className="text-[#5D4037] group-hover:text-[#B82A1E] transition-colors duration-300">
                    {index + 1}. {section.title}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Policy Sections */}
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-2xl p-8 shadow-lg border border-[#B82A1E]/10 mb-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mr-4">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-serif text-[#5D4037]">{section.title}</h2>
              </div>

              {section.content.map((content, contentIndex) => (
                <div key={contentIndex} className="mb-6 last:mb-0">
                  {content.subtitle && (
                    <h3 className="text-xl font-semibold text-[#5D4037] mb-3">{content.subtitle}</h3>
                  )}
                  
                  {content.text && (
                    <p className="text-[#5D4037]/80 leading-relaxed mb-4">{content.text}</p>
                  )}

                  {content.list && (
                    <ul className="space-y-2 ml-6">
                      {content.list.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-[#5D4037]/80 leading-relaxed flex items-start">
                          <span className="text-[#B82A1E] mr-2 mt-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-[#B82A1E]/5 to-[#B82A1E]/10 rounded-2xl p-8 shadow-lg border border-[#B82A1E]/20">
            <h2 className="text-2xl font-serif text-[#5D4037] mb-6 text-center">Contact Us About Privacy</h2>
            <p className="text-[#5D4037]/80 leading-relaxed mb-6 text-center">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Email</h3>
                <p className="text-[#5D4037]/70">office@avdheshanandg.org</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Phone</h3>
                <p className="text-[#5D4037]/70">+91 9410160022</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Address</h3>
                <p className="text-[#5D4037]/70">Juna Akhara, Haridwar, Uttarakhand, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
