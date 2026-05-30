"use client";
import { useEffect, useState, use } from "react";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Loader2, Download, Award, ArrowLeft } from "lucide-react";

export default function CertificatePage({ params }) {
  const unwrappedParams = use(params);
  const { courseId } = unwrappedParams;
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) router.push("/login");
  }, [user, router]);

  if (!mounted || !user) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;

  const progressItem = user.progress?.find(p => (p.courseId?._id || p.courseId) === courseId);
  
  if (!progressItem || !progressItem.certificateEarned) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4 text-center">
        <Award className="w-20 h-20 text-gray-700 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Certificate Not Earned Yet</h1>
        <p className="text-gray-400 mb-8 max-w-md">You must complete all videos, coding exercises, and quizzes in this course to earn your certificate.</p>
        <button onClick={() => router.push("/student/dashboard")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold">Return to Dashboard</button>
      </div>
    );
  }

  const courseTitle = progressItem.courseId?.title || "AI-Learn Course";
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl mb-8 flex justify-between items-center print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button 
          onClick={() => window.print()} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-colors"
        >
          <Download className="w-4 h-4" /> Save as PDF
        </button>
      </div>

      {/* Printable Certificate Area */}
      <div className="w-full max-w-5xl bg-white text-gray-900 p-2 md:p-4 rounded-xl shadow-2xl relative overflow-hidden" style={{ aspectRatio: "1.414/1" }}>
        {/* Decorative Borders */}
        <div className="absolute inset-4 border-[12px] border-[#0f172a] rounded-lg"></div>
        <div className="absolute inset-[24px] border-[2px] border-indigo-600/30 rounded"></div>
        
        {/* Certificate Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12 md:px-24">
          
          <div className="mb-6">
             <Award className="w-20 h-20 md:w-28 md:h-28 text-indigo-600 mx-auto" strokeWidth={1} />
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-[#0f172a] mb-4 font-serif">
            Certificate
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 uppercase tracking-widest mb-10">
            Of Completion
          </h2>

          <p className="text-gray-500 italic text-lg mb-4">This is to certify that</p>
          
          <div className="text-3xl md:text-5xl font-bold text-indigo-600 border-b-2 border-gray-300 pb-2 px-12 mb-6 capitalize font-serif">
            {user.name}
          </div>

          <p className="text-gray-500 italic text-lg mb-6">has successfully completed the course</p>

          <div className="text-2xl md:text-4xl font-bold text-[#0f172a] mb-12">
            {courseTitle}
          </div>

          <div className="w-full flex justify-between items-end px-12 mt-auto pb-12">
            <div className="text-center">
              <div className="text-lg font-bold border-b border-gray-400 pb-1 px-8 mb-2">{dateStr}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Date</div>
            </div>
            
            <div className="text-center flex flex-col items-center">
               <div className="w-24 h-24 border-4 border-indigo-600 rounded-full flex items-center justify-center text-indigo-600 font-bold mb-4 transform -rotate-12 opacity-80">
                 SEAL OF<br/>ACHIEVEMENT
               </div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold border-b border-gray-400 pb-1 px-8 mb-2 font-serif italic text-indigo-800">AI-Learn Admin</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Instructor</div>
            </div>
          </div>

          <div className="absolute bottom-6 w-full text-center text-xs text-gray-400">
            Certificate ID: {progressItem.certificateId || "N/A"}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .w-full.max-w-5xl.bg-white {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100vh !important;
            margin: 0;
            padding: 0;
            border-radius: 0;
            box-shadow: none;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .w-full.max-w-5xl.bg-white * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
}
