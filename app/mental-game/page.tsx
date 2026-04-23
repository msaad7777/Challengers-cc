import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'The Mental Game — Bounce Back Routine | Challengers Cricket Club',
  description: 'Pre-match, during-match, and post-match mental drills for cricketers. The Bounce Back Routine — breathe, reflect, reset.',
};

export default function MentalGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      {/* Hero */}
      <section className="section-padding pt-32 md:pt-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
            <span className="text-sm text-gray-300">Player Development</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            The Mental <span className="gradient-text">Game</span>
          </h1>
          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
            Failure is not the end. It is part of the process.
          </p>
          <p className="text-gray-500 text-sm">
            Pre-match, during-match, and post-match mental tools for every Challengers CC player.
          </p>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-4xl mx-auto">

          {/* THE 3-STEP BOUNCE BACK */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold">
              The 3-Step <span className="gradient-text">Bounce Back</span>
            </h2>
            <p className="text-gray-400 mt-4">Do not carry your last mistake into your next innings.</p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
          </div>

          {/* Step 1 */}
          <div className="glass rounded-2xl p-8 mb-6 border-l-4 border-l-primary-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center border-2 border-primary-500/30">
                <span className="text-xl font-bold gradient-text">1</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">BREATHE</h3>
                <p className="text-primary-400 text-sm">Pause between event and reaction.</p>
              </div>
            </div>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li className="flex items-start gap-2"><span className="text-primary-400">&#9679;</span>3 deep breaths: <strong className="text-white">Inhale 4s, Exhale 6s</strong></li>
              <li className="flex items-start gap-2"><span className="text-primary-400">&#9679;</span>Drop shoulders. Shake out arms.</li>
              <li className="flex items-start gap-2"><span className="text-primary-400">&#9679;</span>Say: <strong className="text-white">&quot;That moment is over. I am back.&quot;</strong></li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="glass rounded-2xl p-8 mb-6 border-l-4 border-l-accent-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-accent-500/20 flex items-center justify-center border-2 border-accent-500/30">
                <span className="text-xl font-bold gradient-text">2</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">REFLECT</h3>
                <p className="text-accent-400 text-sm">Turn it into a lesson, not a loop.</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong className="text-white">1.</strong> What happened? <span className="text-gray-500">(factual, no emotion)</span></p>
              <p><strong className="text-white">2.</strong> What was in my control?</p>
              <p><strong className="text-white">3.</strong> What would I try next time?</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass rounded-2xl p-8 mb-10 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500/30">
                <span className="text-xl font-bold gradient-text">3</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">RESET</h3>
                <p className="text-blue-400 text-sm">Walk in with purpose, not fear.</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p>&quot;Next time I bat, I want to... <span className="text-gray-500">___________</span>&quot;</p>
              <p>&quot;I will back my... <span className="text-gray-500">___________</span>&quot;</p>
              <p>&quot;If I feel pressure, I will... <span className="text-gray-500">___________</span>&quot;</p>
              <p>&quot;My mindset word is: <span className="text-primary-400 font-bold">___________</span>&quot;</p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-primary-400 font-medium italic text-sm">&quot;My score does not define me. My process does.&quot;</p>
            </div>
          </div>

          {/* PRE-MATCH SCRIPT */}
          <div className="glass rounded-2xl p-8 mb-8 border border-primary-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Pre-Match Mental Script</h2>
            <p className="text-gray-500 text-sm mb-4">Read before every innings. 2 minutes to get in the zone.</p>
            <div className="space-y-2 text-gray-300 italic">
              <p>Today, I walk out with clarity.</p>
              <p>I see it early. I play it late.</p>
              <p>My head is still. My base is strong.</p>
              <p>First 10 balls are sacred. I absorb. Then cash in.</p>
              <p>One ball at a time. One decision at a time.</p>
              <p>This is not luck. This is process. This is power.</p>
              <p className="text-primary-400 font-bold not-italic">I walk tall. I won this battle.</p>
            </div>
          </div>

          {/* LOOK BREATHE SAY */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              LOOK. BREATHE. <span className="gradient-text">SAY.</span>
            </h2>
            <p className="text-gray-400 text-center mb-6 text-sm">Your pre-ball routine. Every single delivery.</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-6 border-t-4 border-t-primary-500">
                <h3 className="text-lg font-bold text-white mb-2">LOOK</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>Scan the field for gaps</li>
                  <li>Pick the bowler&apos;s hand</li>
                  <li>Commit to your scoring option</li>
                </ul>
              </div>
              <div className="glass rounded-xl p-6 border-t-4 border-t-accent-500">
                <h3 className="text-lg font-bold text-white mb-2">BREATHE</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>One calm breath through the nose</li>
                  <li>Drop shoulders, release tension</li>
                  <li>Adjust grip, feel the ground</li>
                </ul>
              </div>
              <div className="glass rounded-xl p-6 border-t-4 border-t-blue-500">
                <h3 className="text-lg font-bold text-white mb-2">SAY</h3>
                <p className="text-gray-500 text-xs mb-2">Pick a phrase that works for you:</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>&quot;Watch the ball&quot;</li>
                  <li>&quot;Score now&quot;</li>
                  <li>&quot;See it, hit it&quot;</li>
                  <li>&quot;Stay sharp&quot;</li>
                  <li>&quot;Play on merit&quot;</li>
                  <li>&quot;Trust my game&quot;</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3 PHASE INNINGS */}
          <div className="glass rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">The 3-Phase Innings Plan</h2>
            <p className="text-gray-500 text-sm mb-6">Build, build, explode.</p>
            <div className="space-y-3">
              <div className="glass rounded-xl p-5 border-l-4 border-l-blue-500">
                <span className="text-blue-400 font-bold text-sm">Phase 1: Balls 1-10</span>
                <span className="text-white font-bold ml-2">Start Smart</span>
                <p className="text-gray-400 text-sm mt-1">Settle in. Rotate strike. Leave well. <span className="text-gray-500">Mindset: Calm</span></p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-accent-500">
                <span className="text-accent-400 font-bold text-sm">Phase 2: Balls 11-25</span>
                <span className="text-white font-bold ml-2">Build Fast</span>
                <p className="text-gray-400 text-sm mt-1">Hit gaps. Use your go-to shots. Build pressure back. <span className="text-gray-500">Mindset: Intentional</span></p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-red-500">
                <span className="text-red-400 font-bold text-sm">Phase 3: Balls 25+</span>
                <span className="text-white font-bold ml-2">Finish Strong</span>
                <p className="text-gray-400 text-sm mt-1">Find boundaries. Manipulate field. Dominate. <span className="text-gray-500">Mindset: Brave</span></p>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="glass rounded-2xl p-8 mb-8 border border-accent-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">Track Your Performance</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="text-white font-bold text-sm mb-1">Runs per 10 Balls</h4>
                <p className="text-gray-500 text-xs">Track your scoring tempo</p>
              </div>
              <div className="glass rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="text-white font-bold text-sm mb-1">Intent Score (1-5)</h4>
                <p className="text-gray-500 text-xs">How decisive did you feel?</p>
              </div>
              <div className="glass rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="text-white font-bold text-sm mb-1">Dot Ball %</h4>
                <p className="text-gray-500 text-xs">Lower = more pressure on bowler</p>
              </div>
            </div>
          </div>

          {/* SHOT MAP */}
          <div className="glass rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Shot Map</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-5 border-l-4 border-l-blue-500">
                <h4 className="text-blue-400 font-bold text-sm mb-2">Offside</h4>
                <p className="text-gray-400 text-xs">Square Drive, Late Cut, Back Foot Punch, Cover Drive, Dab to Third Man</p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-primary-500">
                <h4 className="text-primary-400 font-bold text-sm mb-2">Straight</h4>
                <p className="text-gray-400 text-xs">Straight Drive, On Drive, Push Down Ground, Defensive Push, Flick to Mid-on</p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-red-500">
                <h4 className="text-red-400 font-bold text-sm mb-2">Leg-side</h4>
                <p className="text-gray-400 text-xs">Pull, Slap Pull, Flick Off Pads, Whip, Sweep, Lap Sweep, Paddle</p>
              </div>
            </div>
          </div>

          {/* BOUNCE BACK LIKE A PRO */}
          <div className="glass rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Bounce Back Like a Pro</h2>
            <p className="text-gray-500 text-sm mb-6">They fail too. They just do not stay there.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass rounded-xl p-5 border-l-4 border-l-primary-500">
                <h4 className="text-white font-bold text-sm">Steve Smith</h4>
                <p className="text-primary-400 text-xs italic">&quot;I trust my process, not one result.&quot;</p>
                <p className="text-gray-500 text-xs mt-1">Review the process, not just the outcome.</p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-accent-500">
                <h4 className="text-white font-bold text-sm">Ellyse Perry</h4>
                <p className="text-accent-400 text-xs italic">&quot;I know what I can control.&quot;</p>
                <p className="text-gray-500 text-xs mt-1">Return to routine. Control the controllables.</p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-blue-500">
                <h4 className="text-white font-bold text-sm">Ben Stokes</h4>
                <p className="text-blue-400 text-xs italic">&quot;Every knock-down is fuel for the next fight.&quot;</p>
                <p className="text-gray-500 text-xs mt-1">Use failure as fire, not fear.</p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-purple-500">
                <h4 className="text-white font-bold text-sm">Meg Lanning</h4>
                <p className="text-purple-400 text-xs italic">&quot;Review. Reset. Reload.&quot;</p>
                <p className="text-gray-500 text-xs mt-1">Learn fast. Let go faster.</p>
              </div>
            </div>
          </div>

          {/* TRAINING VIDEOS */}
          <div className="glass rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Training Videos</h2>
            <p className="text-gray-500 text-sm mb-6">AB de Villiers 360 Batting Series — 7 powerful batting videos</p>
            <a href="https://www.youtube.com/watch?v=Q8WXoX2p3Ac&list=PLj52RzS-mgRDWdyleqi1rOzoqpIqUBOyW" target="_blank" rel="noopener noreferrer" className="glass rounded-xl p-6 border border-white/10 hover:border-primary-500/30 transition-all flex items-center gap-4 mb-4">
              <span className="text-4xl">▶️</span>
              <div>
                <span className="text-white font-bold">AB de Villiers 360 Batting Masterclass</span>
                <p className="text-gray-500 text-xs mt-1">Full playlist — 7 videos on batting technique, shot selection, and match awareness</p>
              </div>
            </a>
            <a href="https://www.youtube.com/@tpgcricket6843/videos" target="_blank" rel="noopener noreferrer" className="glass rounded-xl p-6 border border-white/10 hover:border-primary-500/30 transition-all flex items-center gap-4">
              <span className="text-4xl">▶️</span>
              <div>
                <span className="text-white font-bold">TPG Cricket Academy — Our Coaching Partner</span>
                <p className="text-gray-500 text-xs mt-1">Coaching drills, batting tips, and training sessions from Coach Manish Giri</p>
              </div>
            </a>
          </div>

          {/* POST-GAME REFLECTION */}
          <div className="glass rounded-2xl p-8 mb-8 border border-accent-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Post-Game Reflection</h2>
            <p className="text-gray-500 text-sm mb-4">Ask yourself after every match or net session:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Did I use my routine every ball?',
                'When did I forget it?',
                'Which shots worked?',
                'Did I stick to my plan?',
                'Where did I score most runs?',
                'How did I get out?',
                'What gaps opened that I missed?',
                'What will I do differently next time?',
              ].map((q) => (
                <div key={q} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="text-accent-400 mt-0.5">&#9744;</span>
                  {q}
                </div>
              ))}
            </div>
          </div>

          {/* NEXT INNINGS RESET CARD */}
          <div className="glass rounded-2xl p-8 mb-8 border-2 border-primary-500/30">
            <h2 className="text-2xl font-bold text-white mb-2">Next Innings Reset Card</h2>
            <p className="text-gray-500 text-sm mb-4">Print this. Keep it in your kit bag.</p>
            <div className="space-y-3">
              {[
                'Next time I bat, I want to...',
                'The strength I want to back is...',
                'If I feel pressure, I will...',
                'My mindset word is...',
                'My bounce back statement is...',
              ].map((prompt) => (
                <div key={prompt} className="glass rounded-xl p-4 border border-white/10">
                  <p className="text-sm text-gray-500 mb-1">{prompt}</p>
                  <div className="border-b border-white/20 pb-3"></div>
                </div>
              ))}
            </div>
          </div>

          {/* C3H PORTAL CTA */}
          <div className="glass rounded-2xl p-8 mb-8 border border-blue-500/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Take Your Game Further</h2>
            <p className="text-gray-400 text-sm mb-4">Registered players get access to the C3H Portal — our private members-only platform with tools built for your development.</p>
            <div className="grid sm:grid-cols-3 gap-3 mb-6 text-left">
              <div className="glass rounded-xl p-4">
                <h4 className="text-blue-400 font-bold text-sm mb-1">Shot Planner</h4>
                <p className="text-gray-500 text-xs">Rate your shots, build game plans vs different bowler types, and track your wagon wheel confidence.</p>
              </div>
              <div className="glass rounded-xl p-4">
                <h4 className="text-primary-400 font-bold text-sm mb-1">Match Reflections</h4>
                <p className="text-gray-500 text-xs">Log how you felt, how you got out, and get personalized coaching tips based on your patterns.</p>
              </div>
              <div className="glass rounded-xl p-4">
                <h4 className="text-accent-400 font-bold text-sm mb-1">Growth Tracking</h4>
                <p className="text-gray-500 text-xs">Intent score trends, recurring mistake alerts, and a personal batting journal that grows with you.</p>
              </div>
            </div>
            <Link href="/#register" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-105">
              Register to Get Access
            </Link>
          </div>

          {/* FINAL QUOTE */}
          <div className="text-center">
            <div className="glass rounded-2xl p-8 border border-primary-500/20">
              <p className="text-xl md:text-2xl font-bold text-white mb-3">
                &quot;I play with presence. I trust my rhythm. Now I go win — one ball at a time.&quot;
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-4"></div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
