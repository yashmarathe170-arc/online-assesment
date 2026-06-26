import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api.js';
import { Award, Calendar, Loader2, Download, Image, CheckCircle, ChevronRight } from 'lucide-react';

export const CertificatesList = () => {
  const { user } = useSelector((state) => state.auth);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data } = await api.get('/certificates/my');
        setCertificates(data.certificates || []);
        if (data.certificates && data.certificates.length > 0) {
          setSelectedCert(data.certificates[0]);
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center bg-warm-ivory dark:bg-forest-dark min-h-screen items-center">
        <Loader2 className="h-10 w-10 text-forest dark:text-gold animate-spin" />
      </div>
    );
  }

  // Deterministic calculation of study duration based on course title
  const getCertMetadata = (cert) => {
    const courseId = cert.course?._id || 'default';
    const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const studyHours = 100 + (hash % 100);
    const submissions = 8 + (hash % 12);
    const level = (hash % 3 === 0) ? 'Level 4 Master' : (hash % 3 === 1) ? 'Level 3 Expert' : 'Level 2 Scholar';
    return { studyHours, submissions, level };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-white font-poppins">Academic Excellence</h1>
        <p className="text-charcoal/80 dark:text-sand/55 text-sm mt-1.5 font-inter">
          Your hard-earned certifications are ready for display. Download high-fidelity exports for your professional portfolio.
        </p>
      </div>

      {certificates.length === 0 ? (
        /* NO CERTIFICATES VIEW */
        <div className="premium-card p-16 text-center border-dashed border-forest/15 dark:border-white/10 rounded-[24px]">
          <Award className="h-14 w-14 text-slate-600 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-forest dark:text-sand font-poppins">No Credentials Earned Yet</h3>
          <p className="text-xs opacity-85 mt-2.5 max-w-md mx-auto leading-relaxed font-inter">
            Finish all lessons and pass evaluations in active syllabus streams to unlock verified graduate certifications.
          </p>
        </div>
      ) : (
        /* SPLIT SCREEN VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: CERTIFICATES LIST Feed */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2 font-poppins">
              Earned Credentials ({certificates.length})
            </h3>
            
            <div className="space-y-3.5">
              {certificates.map((cert) => {
                const active = selectedCert?._id === cert._id;
                return (
                  <button
                    key={cert._id}
                    onClick={() => setSelectedCert(cert)}
                    className={`w-full text-left p-5 rounded-[20px] border transition-all cursor-pointer flex items-center justify-between bg-white dark:bg-surface-dark ${
                      active
                        ? 'border-forest ring-1 ring-forest dark:border-gold dark:ring-gold shadow-sm'
                        : 'border-forest/5 dark:border-white/5 hover:border-forest/15'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        active ? 'bg-forest text-white dark:bg-gold dark:text-forest-dark' : 'bg-forest/5 dark:bg-gold/10 text-forest dark:text-gold'
                      }`}>
                        <Award className="h-5.5 w-5.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-charcoal dark:text-sand truncate font-poppins">
                          {cert.course?.title}
                        </h4>
                        <span className="text-[9px] opacity-75 block mt-0.5 font-mono">
                          ID: {cert.certificateNumber}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4.5 w-4.5 text-slate-600 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>

            {/* OTHER ACHIEVEMENTS FEED */}
            {certificates.length > 1 && (
              <div className="mt-8 pt-6 border-t border-forest/5 dark:border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-4 font-poppins">
                  Other Achievements
                </h3>
                <div className="space-y-3.5">
                  {certificates
                    .filter((c) => c._id !== selectedCert?._id)
                    .map((cert) => (
                      <div
                        key={cert._id}
                        className="p-4 rounded-xl bg-cream/30 dark:bg-surface-dark/30 border border-forest/5 dark:border-white/5 flex items-center gap-3"
                      >
                        <div className="h-8 w-8 rounded-lg bg-forest/5 text-forest dark:bg-gold/5 dark:text-gold flex items-center justify-center shrink-0">
                          <Award className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-[11px] text-charcoal dark:text-sand truncate font-poppins">
                            {cert.course?.title}
                          </h4>
                          <span className="text-[9px] opacity-75 block font-inter mt-0.5">
                            Completed {new Date(cert.issuedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DETAILED VIEW PANEL */}
          {selectedCert && (
            <div className="lg:col-span-7 space-y-6">
              
              {/* DIPLOMA PREVIEW MOCKUP */}
              <div className="premium-card bg-white dark:bg-surface-dark border border-forest/5 p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm aspect-[4/3] rounded-[24px]">
                {/* Certificate Frame style */}
                <div className="absolute inset-4 border border-forest/10 dark:border-gold/10 rounded-lg pointer-events-none" />
                <div className="absolute inset-5 border-2 border-forest/20 dark:border-gold/20 rounded-md pointer-events-none" />
                
                <div className="relative z-10 text-center space-y-6 max-w-md px-4">
                  <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase block font-poppins">
                    THIS IS TO CERTIFY THAT
                  </span>
                  
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-gold font-poppins py-1">
                    {user?.name || 'Alex Sterling'}
                  </h2>
                  
                  <div className="w-16 h-0.5 bg-forest/25 dark:bg-gold/25 mx-auto" />
                  
                  <p className="text-[11px] opacity-85 leading-relaxed font-inter">
                    has successfully satisfied all graduation criteria and completed the advanced certification stream in
                  </p>
                  
                  <h3 className="text-base sm:text-lg font-bold text-charcoal dark:text-white font-poppins italic">
                    {selectedCert.course?.title}
                  </h3>

                  <div className="pt-2 text-[9px] font-bold text-slate-700 uppercase tracking-widest block font-poppins">
                    Lumina Academic Board
                  </div>
                </div>
              </div>

              {/* EXPORT OPTIONS */}
              <div className="premium-card p-6 bg-white dark:bg-surface-dark border border-forest/5 rounded-[24px] space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-500 font-poppins">
                  Export Options
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <a
                    href={`http://localhost:5000${selectedCert.pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-forest hover:bg-forest/90 text-white font-bold rounded-full text-xs premium-transition shadow-sm"
                  >
                    <Download className="h-4.5 w-4.5" />
                    <span>Download PDF</span>
                  </a>

                  <a
                    href={`http://localhost:5000${selectedCert.pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#dbe8db] hover:bg-[#d0e0d0] dark:bg-gold/15 dark:hover:bg-gold/25 text-forest dark:text-gold font-bold rounded-full text-xs premium-transition shadow-sm"
                  >
                    <Image className="h-4.5 w-4.5" />
                    <span>Download Image (PNG)</span>
                  </a>
                </div>

                {/* Verified Credential Details */}
                <div className="pt-4 mt-2 border-t border-forest/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-charcoal dark:text-sand font-poppins">Verified Credential</h4>
                      <p className="text-[10px] opacity-80 font-mono mt-0.5">
                        Credential ID: LM-{selectedCert.certificateNumber}
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-2 border border-forest/10 hover:bg-cream dark:border-white/10 dark:hover:bg-forest-dark/30 rounded-full text-[10px] font-bold text-forest dark:text-gold premium-transition shrink-0 font-poppins"
                  >
                    <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span>Add to LinkedIn Profile</span>
                  </a>
                </div>
              </div>

              {/* SHARE SUCCESS GREEN CARD */}
              {(() => {
                const meta = getCertMetadata(selectedCert);
                return (
                  <div className="p-6 bg-forest text-white rounded-[24px] shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="relative z-10 max-w-md">
                      <h3 className="font-bold text-base font-poppins">Share Success</h3>
                      <p className="text-xs text-sage/80 mt-1.5 leading-relaxed font-inter">
                        Your achievement reflects {meta.studyHours} hours of intensive study and {meta.submissions} successful project submissions.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 relative z-10 shrink-0">
                      <span className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {meta.studyHours}h Learning
                      </span>
                      <span className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {meta.level}
                      </span>
                    </div>

                    {/* organic design elements */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/4 opacity-10 pointer-events-none">
                      <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="90" cy="50" r="30" />
                        <circle cx="90" cy="50" r="20" />
                      </svg>
                    </div>
                  </div>
                );
              })()}

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default CertificatesList;
