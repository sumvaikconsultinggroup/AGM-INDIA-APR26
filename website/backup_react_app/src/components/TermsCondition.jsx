"use client"

import { useEffect, useRef } from "react"
import { FileText, Scale, Users, Shield, AlertTriangle, Globe, ArrowLeft } from "lucide-react"

export default function TermsConditions() {
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
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <Scale className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "By accessing and using our website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
        },
        {
          text: "These Terms and Conditions constitute a legally binding agreement between you and our spiritual organization. Your use of our services indicates your acceptance of these terms.",
        },
      ],
    },
    {
      id: "definitions",
      title: "Definitions",
      icon: <FileText className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "For the purposes of these Terms and Conditions:",
          list: [
            "'Organization', 'we', 'us', or 'our' refers to our spiritual center and its affiliated entities",
            "'User', 'you', or 'your' refers to any individual or entity accessing our services",
            "'Services' includes our website, programs, events, teachings, and all related offerings",
            "'Content' refers to all text, images, videos, audio, and other materials on our platform",
            "'Personal Information' means any information that identifies or can be used to identify you",
          ],
        },
      ],
    },
    {
      id: "use-of-services",
      title: "Use of Our Services",
      icon: <Users className="text-[#B82A1E]" size={24} />,
      content: [
        {
          subtitle: "Permitted Use",
          text: "You may use our services for lawful purposes only and in accordance with these Terms. Permitted uses include:",
          list: [
            "Accessing spiritual teachings and educational content",
            "Participating in online and offline programs and events",
            "Making donations to support our mission",
            "Communicating with our community members and staff",
            "Sharing our content for non-commercial, educational purposes",
          ],
        },
        {
          subtitle: "Prohibited Use",
          text: "You agree not to use our services for any of the following prohibited activities:",
          list: [
            "Violating any applicable laws or regulations",
            "Infringing on intellectual property rights",
            "Transmitting harmful, offensive, or inappropriate content",
            "Attempting to gain unauthorized access to our systems",
            "Using our services for commercial purposes without permission",
            "Disrupting or interfering with our services or other users",
            "Impersonating others or providing false information",
          ],
        },
      ],
    },
    {
      id: "user-accounts",
      title: "User Accounts and Registration",
      icon: <Users className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "To access certain features of our services, you may need to create an account. When creating an account, you agree to:",
          list: [
            "Provide accurate, current, and complete information",
            "Maintain and update your information as needed",
            "Keep your login credentials secure and confidential",
            "Accept responsibility for all activities under your account",
            "Notify us immediately of any unauthorized use of your account",
          ],
        },
        {
          text: "We reserve the right to suspend or terminate accounts that violate these terms or are inactive for extended periods.",
        },
      ],
    },
    {
      id: "content-intellectual-property",
      title: "Content and Intellectual Property",
      icon: <Shield className="text-[#B82A1E]" size={24} />,
      content: [
        {
          subtitle: "Our Content",
          text: "All content on our website and services, including but not limited to text, graphics, logos, images, audio clips, video clips, and software, is the property of our organization or its content suppliers and is protected by copyright and other intellectual property laws.",
        },
        {
          subtitle: "User-Generated Content",
          text: "By submitting content to our services (comments, testimonials, etc.), you grant us a non-exclusive, royalty-free, perpetual license to use, modify, and distribute such content for our spiritual and educational mission.",
        },
        {
          subtitle: "Respect for Intellectual Property",
          text: "You agree to respect the intellectual property rights of others and not to upload, post, or transmit any content that infringes on such rights.",
        },
      ],
    },
    {
      id: "donations-payments",
      title: "Donations and Payments",
      icon: <Scale className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "Donations to our organization are voluntary contributions to support our spiritual mission and community service activities. By making a donation, you acknowledge that:",
          list: [
            "Donations are made voluntarily without expectation of goods or services in return",
            "All donations are final and non-refundable unless required by law",
            "You are responsible for determining the tax deductibility of your donations",
            "We will use donations in accordance with our stated mission and purposes",
            "Payment information is processed securely through trusted payment processors",
          ],
        },
      ],
    },
    {
      id: "events-programs",
      title: "Events and Programs",
      icon: <Users className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "Participation in our events and programs is subject to the following terms:",
          list: [
            "Registration may be required for certain events and programs",
            "We reserve the right to cancel or modify events due to circumstances beyond our control",
            "Participants are expected to conduct themselves respectfully and in accordance with our community guidelines",
            "Photography or recording may occur during events for promotional purposes",
            "Refund policies for paid events will be clearly stated at the time of registration",
          ],
        },
      ],
    },
    {
      id: "privacy-data",
      title: "Privacy and Data Protection",
      icon: <Shield className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.",
        },
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers and Limitations",
      icon: <AlertTriangle className="text-[#B82A1E]" size={24} />,
      content: [
        {
          subtitle: "Spiritual Guidance Disclaimer",
          text: "Our teachings, guidance, and programs are intended for spiritual growth and educational purposes. They are not a substitute for professional medical, psychological, or legal advice. Always consult qualified professionals for specific health, mental health, or legal concerns.",
        },
        {
          subtitle: "Service Availability",
          text: "We strive to maintain continuous service availability but cannot guarantee uninterrupted access. Our services may be temporarily unavailable due to maintenance, technical issues, or circumstances beyond our control.",
        },
        {
          subtitle: "Third-Party Content",
          text: "Our services may include links to third-party websites or content. We are not responsible for the accuracy, completeness, or reliability of such third-party content.",
        },
      ],
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: <Scale className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "To the fullest extent permitted by law, our organization shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use of our services.",
        },
        {
          text: "Our total liability for any claims arising from your use of our services shall not exceed the amount you have paid to us in the twelve months preceding the claim.",
        },
      ],
    },
    {
      id: "indemnification",
      title: "Indemnification",
      icon: <Shield className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "You agree to indemnify, defend, and hold harmless our organization, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your use of our services or violation of these Terms.",
        },
      ],
    },
    {
      id: "termination",
      title: "Termination",
      icon: <AlertTriangle className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "We reserve the right to terminate or suspend your access to our services at any time, with or without cause, and with or without notice. Upon termination, your right to use our services will cease immediately.",
        },
        {
          text: "You may terminate your use of our services at any time by discontinuing use and, if applicable, closing your account.",
        },
      ],
    },
    {
      id: "governing-law",
      title: "Governing Law and Jurisdiction",
      icon: <Scale className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Haridwar, Uttarakhand, India.",
        },
      ],
    },
    {
      id: "changes-terms",
      title: "Changes to Terms",
      icon: <FileText className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after any changes constitutes acceptance of the new terms.",
        },
        {
          text: "We encourage you to review these terms periodically to stay informed of any updates.",
        },
      ],
    },
    {
      id: "severability",
      title: "Severability",
      icon: <Scale className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions will continue to be valid and enforceable to the fullest extent permitted by law.",
        },
      ],
    },
    {
      id: "entire-agreement",
      title: "Entire Agreement",
      icon: <FileText className="text-[#B82A1E]" size={24} />,
      content: [
        {
          text: "These Terms and Conditions, together with our Privacy Policy, constitute the entire agreement between you and our organization regarding the use of our services and supersede all prior agreements and understandings.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f5] to-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden flex items-center justify-center">
        <div
          ref={parallaxRef}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/placeholder.svg?height=800&width=1920&text=Terms+Conditions')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-[#7B0000] z-10"></div>

        <div className="relative z-20 text-center text-white px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-white/10 backdrop-blur-sm">
            <FileText className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Terms & Conditions</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">Guidelines for Our Sacred Community</p>
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
              <h2 className="text-3xl font-serif text-[#5D4037] mb-4">Welcome to Our Community</h2>
              <p className="text-[#5D4037]/80 leading-relaxed">
                These Terms and Conditions govern your use of our website and services. By accessing our platform, you
                agree to abide by these terms and become part of our spiritual community with mutual respect and
                understanding.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Scale className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Fair</h3>
                <p className="text-sm text-[#5D4037]/70">
                  Balanced terms that protect both our community and your rights
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Respectful</h3>
                <p className="text-sm text-[#5D4037]/70">Guidelines that foster a harmonious spiritual community</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Protective</h3>
                <p className="text-sm text-[#5D4037]/70">Safeguarding our mission and your spiritual journey</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-[#B82A1E]/5 rounded-lg">
              <p className="text-sm text-[#5D4037]/80">
                <strong>Last Updated:</strong> January 15, 2024
                <br />
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

          {/* Terms Sections */}
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

                  {content.text && <p className="text-[#5D4037]/80 leading-relaxed mb-4">{content.text}</p>}

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
            <h2 className="text-2xl font-serif text-[#5D4037] mb-6 text-center">Questions About These Terms?</h2>
            <p className="text-[#5D4037]/80 leading-relaxed mb-6 text-center">
              If you have any questions about these Terms and Conditions, please dont hesitate to contact us:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Email</h3>
                <p className="text-[#5D4037]/70">office@avdheshanandg.org</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Scale className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Phone</h3>
                <p className="text-[#5D4037]/70">+91 9410160022</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="text-[#B82A1E]" size={24} />
                </div>
                <h3 className="font-semibold text-[#5D4037] mb-2">Address</h3>
                <p className="text-[#5D4037]/70">Juna Akhara, Haridwar, Uttarakhand, India</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/50 rounded-lg text-center">
              <p className="text-sm text-[#5D4037]/80">
                By continuing to use our services, you acknowledge that you have read, understood, and agree to be bound
                by these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
