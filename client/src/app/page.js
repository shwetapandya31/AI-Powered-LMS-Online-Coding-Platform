"use client";
import Link from "next/link";
import { BookOpen, Code, Video, Award, Brain } from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import useAuthStore from "../store/useAuthStore";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30 transition-colors">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-indigo-500" />
              <span className="font-bold text-xl tracking-tight">AI-Learn</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
              <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">Sign up</Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Master Skills with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              AI-Powered Learning
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Experience the future of education. Personalized AI hints, intelligent quizzes, and interactive coding challenges in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              Start Learning for Free
            </Link>
            <Link href="/courses" className="bg-secondary hover:bg-secondary/80 border border-border text-foreground px-8 py-4 rounded-xl font-bold text-lg transition-all">
              Explore Courses
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-border bg-muted/50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Everything you need to succeed</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Video, title: "Video Lectures", desc: "High-quality video content from expert instructors." },
                { icon: Code, title: "Interactive Coding", desc: "Solve problems in our integrated browser editor." },
                { icon: Brain, title: "AI Assistant", desc: "Get instant doubt resolution and personalized hints." },
                { icon: Award, title: "Certificates", desc: "Earn verifiable certificates upon course completion." },
              ].map((feature, i) => (
                <div key={i} className="bg-card text-card-foreground border border-border p-6 rounded-2xl hover:border-indigo-500/50 transition-colors group">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
