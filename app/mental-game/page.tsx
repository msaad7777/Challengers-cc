import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
            Pre-match, during-match, and post-match mental drills for every Challengers CC player.
          </p>
        </div>
      </section>

      {/* Why Bounce Back Matters */}
      <section className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border border-accent-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Why the Bounce Back Routine Matters</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Most cricketers train hard. They improve in the nets. But after a failure — a low score, getting out early, or letting pressure win — they lose confidence, overthink, avoid risk, and start questioning themselves.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              That is not a technical issue — that is a <strong className="text-white">bounce-back issue</strong>. Without the ability to mentally reset, one bad moment turns into two, then a slump, then a player who does not trust themselves anymore.
            </p>
            <div className="glass rounded-xl p-6 border border-primary-500/20">
              <p className="text-primary-400 text-lg font-medium text-center italic">
                &quot;We don&apos;t want players who fear getting out. We want players who learn every time they do.&quot;
              </p>
            </div>
          </div>

          {/* Failure Isn't Bad */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">Failure Is Not Bad</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              In cricket — especially as a batter — failure is part of the job. Even the best players in the world get out 50%+ of the time, make ducks in front of crowds, and throw away starts.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              What separates them? They have a <strong className="text-white">bounce-back system</strong>. They process failure without shame, reflect without emotion clouding judgement, and move forward with clarity and intent.
            </p>
          </div>

          {/* The Research */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border border-blue-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">What the Research Says</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="text-2xl">📊</div>
                <div>
                  <h4 className="text-white font-bold mb-1">Resilience is a trainable skill</h4>
                  <p className="text-gray-400 text-sm">Athletes taught post-failure routines improved performance consistency and reported less fear of failure. <span className="text-gray-500">— Journal of Sport Psychology, 2020</span></p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">🧠</div>
                <div>
                  <h4 className="text-white font-bold mb-1">Reflection boosts retention by 23%</h4>
                  <p className="text-gray-400 text-sm">Taking 10 minutes to reflect on a failure improves learning compared to just &quot;moving on.&quot; <span className="text-gray-500">— Harvard Business School, Di Stefano et al., 2014</span></p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">💡</div>
                <div>
                  <h4 className="text-white font-bold mb-1">Reframing beats suppression</h4>
                  <p className="text-gray-400 text-sm">Helping players reframe emotional events into constructive feedback is more effective than trying to &quot;stay positive.&quot;</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bounce Back Speed */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 text-center border border-accent-500/20">
            <h2 className="text-3xl font-bold text-white mb-4">Your Superpower: Bounce Back Speed</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              You cannot avoid getting out. But you can shorten how long it takes to recover. Players who bounce back quickly do not stay stuck, do not carry mistakes, and are confident — not because they always succeed, but because they know how to respond when they do not.
            </p>
            <div className="inline-block glass rounded-xl px-8 py-4 border border-primary-500/30">
              <p className="text-primary-400 font-bold text-lg">Change &quot;I got out. I failed.&quot;</p>
              <p className="text-white font-bold text-lg mt-1">to &quot;I had a moment. I learned from it. I am growing.&quot;</p>
            </div>
          </div>

          {/* THE 3 STEPS */}
          <div className="mb-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold">
                The 3-Step <span className="gradient-text">Bounce Back</span> Routine
              </h2>
              <p className="text-gray-400 mt-4">Do not carry your last mistake into your next innings.</p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
            </div>

            {/* Step 1 */}
            <div className="glass rounded-2xl p-8 md:p-12 mb-6 border-l-4 border-l-primary-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border-2 border-primary-500/30">
                  <span className="text-2xl font-bold gradient-text">1</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">BREATHE</h3>
                  <p className="text-primary-400 text-sm">Calm your body. Create a pause between event and reaction.</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                When you get out, your brain activates the amygdala — the fear/emotion centre. Breathing resets your nervous system so you can think clearly again.
              </p>
              <div className="glass rounded-xl p-6 border border-white/10">
                <h4 className="text-white font-bold mb-3">What to do:</h4>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-1">&#9679;</span>
                    Stand still. Place your bat down.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-1">&#9679;</span>
                    Take 3 deep breaths: <strong className="text-white">Inhale 4 seconds, Exhale 6 seconds</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-1">&#9679;</span>
                    Drop your shoulders. Shake out your arms.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-1">&#9679;</span>
                    Say to yourself: <strong className="text-white">&quot;That moment is over. I am back.&quot;</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass rounded-2xl p-8 md:p-12 mb-6 border-l-4 border-l-accent-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border-2 border-accent-500/30">
                  <span className="text-2xl font-bold gradient-text">2</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">REFLECT</h3>
                  <p className="text-accent-400 text-sm">Turn the moment into a lesson, not a loop.</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Players who reflect constructively improve faster. This is not about beating yourself up — it is about separating what happened from what it means.
              </p>
              <div className="glass rounded-xl p-6 border border-white/10">
                <h4 className="text-white font-bold mb-3">Ask yourself 3 questions:</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-accent-400 font-bold text-lg">1.</span>
                    <div>
                      <p className="text-white font-medium">What happened?</p>
                      <p className="text-gray-400 text-sm">Keep it factual. E.g. &quot;I tried to hit over mid-off and mistimed it.&quot;</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent-400 font-bold text-lg">2.</span>
                    <div>
                      <p className="text-white font-medium">What was in my control?</p>
                      <p className="text-gray-400 text-sm">Shot choice? Intent? Footwork? Mindset?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent-400 font-bold text-lg">3.</span>
                    <div>
                      <p className="text-white font-medium">What would I try next time?</p>
                      <p className="text-gray-400 text-sm">E.g. &quot;Play later.&quot; / &quot;Stick to my zone.&quot; / &quot;Back myself, don&apos;t hesitate.&quot;</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass rounded-2xl p-8 md:p-12 mb-6 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border-2 border-blue-500/30">
                  <span className="text-2xl font-bold gradient-text">3</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">RESET</h3>
                  <p className="text-blue-400 text-sm">Set a clear, confident plan for your next innings.</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                This is where players who learn, grow. Instead of fearing failure again, they walk in with purpose.
              </p>
              <div className="glass rounded-xl p-6 border border-white/10">
                <h4 className="text-white font-bold mb-3">Your 1-minute reset:</h4>
                <div className="space-y-3 text-gray-300">
                  <p>&quot;Next time I bat, I want to... <span className="text-gray-500">(e.g. attack spin early / play straighter)</span>&quot;</p>
                  <p>&quot;I will back my... <span className="text-gray-500">(e.g. pull shot / zone between cover and mid-off)</span>&quot;</p>
                  <p>&quot;If I feel nervous, I will... <span className="text-gray-500">(e.g. breathe, tap the bat, say &apos;I am ready&apos;)</span>&quot;</p>
                  <p>&quot;My mindset word is: <span className="text-primary-400 font-bold">________</span> <span className="text-gray-500">(e.g. Brave / Calm / Free / Clear)</span>&quot;</p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                  <p className="text-primary-400 font-bold italic">&quot;My score does not define me. My process does.&quot;</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border border-primary-500/20">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Quick Reference</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-6 text-center border border-primary-500/20">
                <div className="text-3xl mb-3">🫁</div>
                <h4 className="text-white font-bold mb-2">BREATHE</h4>
                <p className="text-gray-400 text-sm">3 deep breaths. Inhale 4s, exhale 6s. &quot;That moment is over.&quot;</p>
              </div>
              <div className="glass rounded-xl p-6 text-center border border-accent-500/20">
                <div className="text-3xl mb-3">🪞</div>
                <h4 className="text-white font-bold mb-2">REFLECT</h4>
                <p className="text-gray-400 text-sm">What happened? What was in my control? What next time?</p>
              </div>
              <div className="glass rounded-xl p-6 text-center border border-blue-500/20">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="text-white font-bold mb-2">RESET</h4>
                <p className="text-gray-400 text-sm">Set intent. Back your strength. Choose your mindset word.</p>
              </div>
            </div>
          </div>

          {/* What Went Wrong Tool */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">The &quot;What Went Wrong?&quot; Tool</h2>
            <p className="text-gray-400 mb-6">Review it. Do not relive it.</p>

            <div className="space-y-6">
              <div className="glass rounded-xl p-6 border border-white/10">
                <h4 className="text-primary-400 font-bold mb-2">Part 1: The Facts</h4>
                <p className="text-gray-300 mb-2">What happened? Write it in one factual sentence.</p>
                <p className="text-gray-500 text-sm italic">&quot;I tried to hit over mid-off too early and mistimed it.&quot;</p>
              </div>

              <div className="glass rounded-xl p-6 border border-white/10">
                <h4 className="text-accent-400 font-bold mb-2">Part 2: Common Causes Checklist</h4>
                <p className="text-gray-300 mb-3">Circle what applies:</p>
                <div className="flex flex-wrap gap-2">
                  {['Poor shot selection', 'Wrong field awareness', 'Rush decision', 'No intent', 'Lack of a plan', 'Trying to hit too hard', 'Defensive mindset', 'Fatigue or distraction', 'Reacted to pressure', 'Reckless shot'].map((cause) => (
                    <span key={cause} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                      {cause}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl p-6 border border-white/10">
                <h4 className="text-blue-400 font-bold mb-2">Part 3: Next Time Plan</h4>
                <p className="text-gray-300 mb-2">What would I do differently?</p>
                <p className="text-gray-500 text-sm italic">&quot;Next time I will look for two balls to assess, then go hard in my zone.&quot;</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-4">Pro tip: Do this the same day. Review your last 3 dismissals and look for patterns.</p>
          </div>

          {/* Next Innings Reset Card */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border-2 border-primary-500/30">
            <h2 className="text-3xl font-bold text-white mb-2">Next Innings Reset Card</h2>
            <p className="text-gray-400 mb-6">Print this. Keep it in your kit bag.</p>
            <div className="space-y-4 text-gray-300 text-lg">
              <div className="glass rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-500 mb-1">Next time I bat, I want to...</p>
                <div className="border-b border-white/20 pb-4"></div>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-500 mb-1">The strength I want to back is...</p>
                <div className="border-b border-white/20 pb-4"></div>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-500 mb-1">If I feel pressure, I will...</p>
                <div className="border-b border-white/20 pb-4"></div>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-500 mb-1">My mindset word is...</p>
                <div className="border-b border-white/20 pb-4"></div>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-500 mb-1">My bounce back statement is...</p>
                <div className="border-b border-white/20 pb-4"></div>
              </div>
            </div>
          </div>

          {/* Bounce Back Like a Pro */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Bounce Back Like a Pro</h2>
            <p className="text-gray-400 mb-6">They fail too. They just do not stay there.</p>

            <div className="space-y-6">
              <div className="glass rounded-xl p-6 border-l-4 border-l-primary-500">
                <h4 className="text-white font-bold">Steve Smith</h4>
                <p className="text-primary-400 text-sm italic mb-2">&quot;I trust my process, not one result.&quot;</p>
                <p className="text-gray-400 text-sm">After getting out, Smith focuses on what he did well rather than the dismissal. He journals patterns and builds a plan for the next innings.</p>
                <p className="text-gray-500 text-xs mt-2">Takeaway: Review the process, not just the outcome.</p>
              </div>
              <div className="glass rounded-xl p-6 border-l-4 border-l-accent-500">
                <h4 className="text-white font-bold">Ellyse Perry</h4>
                <p className="text-accent-400 text-sm italic mb-2">&quot;I know what I can control.&quot;</p>
                <p className="text-gray-400 text-sm">Perry speaks about separating emotion from execution. After failure, she grounds herself with simple routines — deep breath, setup, and a scoring plan.</p>
                <p className="text-gray-500 text-xs mt-2">Takeaway: Return to routine. Control the controllables.</p>
              </div>
              <div className="glass rounded-xl p-6 border-l-4 border-l-blue-500">
                <h4 className="text-white font-bold">Ben Stokes</h4>
                <p className="text-blue-400 text-sm italic mb-2">&quot;Every knock-down is fuel for the next fight.&quot;</p>
                <p className="text-gray-400 text-sm">Stokes openly shares how he has used failure and pressure moments to fuel mental growth. His resilience comes from visualisation, breathwork, and embracing challenge.</p>
                <p className="text-gray-500 text-xs mt-2">Takeaway: Use failure as fire, not fear.</p>
              </div>
              <div className="glass rounded-xl p-6 border-l-4 border-l-purple-500">
                <h4 className="text-white font-bold">Meg Lanning</h4>
                <p className="text-purple-400 text-sm italic mb-2">&quot;Review. Reset. Reload.&quot;</p>
                <p className="text-gray-400 text-sm">Lanning reflects on every performance with a focus on what to keep, what to fix, and what to forget.</p>
                <p className="text-gray-500 text-xs mt-2">Takeaway: Learn fast. Let go faster.</p>
              </div>
            </div>
          </div>

          {/* Daily Mental Training */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border border-primary-500/20">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Daily Mental Training</h2>
            <p className="text-gray-400 text-center mb-6">Do one of these after every net or match:</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">📝</div>
                <p className="text-gray-300 text-sm">Write your Next Innings Reset Plan</p>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🗣️</div>
                <p className="text-gray-300 text-sm">Say your mindset word before first ball</p>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">📖</div>
                <p className="text-gray-300 text-sm">Reflect: &quot;What did I learn today?&quot;</p>
              </div>
            </div>
          </div>

          {/* Final Quote */}
          <div className="text-center mb-8">
            <div className="glass rounded-2xl p-8 md:p-12 border border-accent-500/20">
              <p className="text-2xl md:text-3xl font-bold text-white mb-4">
                &quot;You don&apos;t need to feel perfect to perform well. You just need to be present, clear, and ready.&quot;
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6 mb-6"></div>
              <p className="text-gray-400">
                Breathe. Reflect. Reset. That is the Bounce Back Routine.
              </p>
            </div>
          </div>

          {/* PRE-MATCH ROUTINE */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border border-primary-500/20">
            <h2 className="text-3xl font-bold text-white mb-2">Pre-Match Mental Script</h2>
            <p className="text-gray-400 mb-6">Read this before every innings. 2-3 minutes to get in the zone.</p>
            <div className="space-y-3 text-gray-300 text-lg italic leading-relaxed">
              <p>Today, I walk out with clarity.</p>
              <p>I see it early. I play it late.</p>
              <p>My head is still. My base is strong.</p>
              <p>First 10 balls are sacred.</p>
              <p>I absorb. Then cash in.</p>
              <p>I lead with front foot. I breathe. I rebuild.</p>
              <p>One ball at a time. One decision at a time.</p>
              <p>This is not luck. This is a process. This is power.</p>
              <p className="text-primary-400 font-bold not-italic">I walk tall. I won this battle.</p>
            </div>
          </div>

          {/* LOOK BREATHE SAY */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold">
                LOOK. BREATHE. <span className="gradient-text">SAY.</span>
              </h2>
              <p className="text-gray-400 mt-2">Your 3-step pre-ball routine. Every single delivery.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6 border-t-4 border-t-primary-500">
                <h3 className="text-xl font-bold text-white mb-3">LOOK</h3>
                <p className="text-primary-400 text-sm font-medium mb-3">Visual Trigger</p>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>Scan the field for gaps</li>
                  <li>Pick the bowler&apos;s hand and wrist</li>
                  <li>Commit to your scoring option</li>
                </ul>
              </div>
              <div className="glass rounded-2xl p-6 border-t-4 border-t-accent-500">
                <h3 className="text-xl font-bold text-white mb-3">BREATHE</h3>
                <p className="text-accent-400 text-sm font-medium mb-3">Physical Cue</p>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>One calm breath through the nose</li>
                  <li>Drop shoulders, release tension</li>
                  <li>Feel the ground under your feet</li>
                </ul>
              </div>
              <div className="glass rounded-2xl p-6 border-t-4 border-t-blue-500">
                <h3 className="text-xl font-bold text-white mb-3">SAY</h3>
                <p className="text-blue-400 text-sm font-medium mb-3">Verbal Cue</p>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>&quot;Ball dekh kahan pitch ho raha hai&quot;</li>
                  <li>&quot;Merit pe khelna hai&quot;</li>
                  <li>Short trigger phrase that locks intent</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3 PHASE INNINGS PLAN */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">The 3-Phase Innings Plan</h2>
            <p className="text-gray-400 mb-6">You do not just &quot;survive and swing.&quot; You build, build, explode.</p>
            <div className="space-y-4">
              <div className="glass rounded-xl p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-blue-400 font-bold text-lg">Phase 1</span>
                  <span className="text-white font-bold">Start Smart (Balls 1-10)</span>
                </div>
                <p className="text-gray-400 text-sm mb-2"><strong className="text-white">Goal:</strong> Settle in, find timing, assess conditions</p>
                <p className="text-gray-400 text-sm mb-2"><strong className="text-white">Priority:</strong> Rotate strike, leave well, get singles</p>
                <p className="text-gray-400 text-sm"><strong className="text-white">Mindset:</strong> Calm, sharp, patient</p>
              </div>
              <div className="glass rounded-xl p-6 border-l-4 border-l-accent-500">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-accent-400 font-bold text-lg">Phase 2</span>
                  <span className="text-white font-bold">Build Fast (Balls 11-25)</span>
                </div>
                <p className="text-gray-400 text-sm mb-2"><strong className="text-white">Goal:</strong> Score freely and build pressure back</p>
                <p className="text-gray-400 text-sm mb-2"><strong className="text-white">Priority:</strong> Hit gaps, use your go-to scoring shots</p>
                <p className="text-gray-400 text-sm"><strong className="text-white">Mindset:</strong> Intentional, alert, proactive</p>
              </div>
              <div className="glass rounded-xl p-6 border-l-4 border-l-red-500">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-red-400 font-bold text-lg">Phase 3</span>
                  <span className="text-white font-bold">Finish Strong (Balls 25+)</span>
                </div>
                <p className="text-gray-400 text-sm mb-2"><strong className="text-white">Goal:</strong> Accelerate and dominate</p>
                <p className="text-gray-400 text-sm mb-2"><strong className="text-white">Priority:</strong> Find boundaries, manipulate field</p>
                <p className="text-gray-400 text-sm"><strong className="text-white">Mindset:</strong> Brave, calculated, aggressive</p>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border border-accent-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Performance KPIs</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">📊</div>
                <h4 className="text-white font-bold mb-2">Runs per 10 Balls</h4>
                <p className="text-gray-400 text-sm mb-2">Target: 5-7 runs per 10 balls</p>
                <p className="text-gray-500 text-xs">(Total runs / Balls faced) x 10</p>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="text-white font-bold mb-2">Intent Score (1-5)</h4>
                <p className="text-gray-400 text-sm mb-2">How decisive and purposeful did you feel?</p>
                <p className="text-gray-500 text-xs">1=Froze | 3=Second-guessed | 5=Total clarity</p>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="text-white font-bold mb-2">Dot Ball %</h4>
                <p className="text-gray-400 text-sm mb-2">Target: Under 40%</p>
                <p className="text-gray-500 text-xs">(Dot balls / Total balls) x 100</p>
              </div>
            </div>
          </div>

          {/* SHOT MAP */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">Shot Map</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-6 border-l-4 border-l-blue-500">
                <h4 className="text-blue-400 font-bold mb-3">Offside Shots</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>Square Drive</li><li>Late Cut</li><li>Back Foot Punch</li><li>Cover Drive</li><li>Square Push</li><li>Dab to Third Man</li>
                </ul>
              </div>
              <div className="glass rounded-xl p-6 border-l-4 border-l-primary-500">
                <h4 className="text-primary-400 font-bold mb-3">Straight Shots</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>Straight Drive</li><li>Push Down the Ground</li><li>On Drive</li><li>Defensive Push</li><li>Lofted Straight Drive</li><li>Flick to Mid-on</li>
                </ul>
              </div>
              <div className="glass rounded-xl p-6 border-l-4 border-l-red-500">
                <h4 className="text-red-400 font-bold mb-3">Leg-side Shots</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>Slap Pull</li><li>Flick Off Pads</li><li>Whip through Mid-wicket</li><li>Sweep</li><li>Lap Sweep</li><li>Pull Shot</li><li>Paddle</li>
                </ul>
              </div>
            </div>
          </div>

          {/* WEEKLY TRAINING SCHEDULE */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border border-primary-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Mon-Fri Visual Training Schedule</h2>
            <div className="space-y-4">
              <div className="glass rounded-xl p-5 border-l-4 border-l-blue-500">
                <h4 className="text-white font-bold">Monday — CNS & Vision Activation</h4>
                <p className="text-gray-400 text-sm mt-1">Laser pointer tracking | Ball drop react drills | Breathwork + mirror stillness</p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-primary-500">
                <h4 className="text-white font-bold">Tuesday — Batting Integration</h4>
                <p className="text-gray-400 text-sm mt-1">Occlusion net practice | Numbered ball zone focus | Light nets with delayed cue</p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-accent-500">
                <h4 className="text-white font-bold">Wednesday — Mental Reset & Head Alignment</h4>
                <p className="text-gray-400 text-sm mt-1">Breath cycle (4-1-6) | Mirror eye-level tracking | Visualisation (10 balls from crease)</p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-purple-500">
                <h4 className="text-white font-bold">Thursday — Visual Precision & Judgement</h4>
                <p className="text-gray-400 text-sm mt-1">Numbered ball pickup | Eye switch drills (bowler&apos;s eye to release) | Head-in-line with video</p>
              </div>
              <div className="glass rounded-xl p-5 border-l-4 border-l-red-500">
                <h4 className="text-white font-bold">Friday — Simulation Day</h4>
                <p className="text-gray-400 text-sm mt-1">First 20 balls with zone lock-in | 2-zone scoring simulation | Mirror check + 3-sec reset</p>
              </div>
            </div>
          </div>

          {/* TECHNICAL ALIGNMENT */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">Technical Alignment — Stance to Contact</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6 border border-white/10">
                <h4 className="text-primary-400 font-bold mb-3">Stance Setup</h4>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>Grip soft on inner thigh</li>
                  <li>Elbows locked till shot command</li>
                  <li>Bat no wider than off stump</li>
                  <li>Head over front leg stump</li>
                  <li>Front foot slightly open, ready to lead</li>
                  <li>Back foot flat, toe points to cover-point</li>
                  <li>Eyes wide. Still.</li>
                </ul>
              </div>
              <div className="glass rounded-xl p-6 border border-white/10">
                <h4 className="text-accent-400 font-bold mb-3">Shot Execution Rules</h4>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>Cover Drive: Front foot moves max 3 stumps</li>
                  <li>Backfoot: Land on toe, play into gaps</li>
                  <li>Front Foot: Land on heel, play under head</li>
                  <li>Pull: Elbows lock early, extend after contact</li>
                  <li>Signal forward even on short balls. Then release.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AVOID THESE MISTAKES */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border border-red-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">Avoid These Mistakes</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {['No high backlift', 'No tight grip', 'No front foot freeze', 'No chasing', 'No mid-line bat hover', 'No overreach', 'No shortcut shots'].map((mistake) => (
                <div key={mistake} className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="text-red-400">&#10007;</span>
                  {mistake}
                </div>
              ))}
            </div>
          </div>

          {/* VIDEO RESOURCES */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">Training Videos</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <a href="https://www.youtube.com/watch?v=_WzvojkFOXsD" target="_blank" rel="noopener noreferrer" className="glass rounded-xl p-5 border border-white/10 hover:border-primary-500/30 transition-all flex items-center gap-3">
                <span className="text-3xl">▶️</span>
                <span className="text-gray-300 text-sm">Batting Technique Video 1</span>
              </a>
              <a href="https://www.youtube.com/watch?v=I77hh5I69gA" target="_blank" rel="noopener noreferrer" className="glass rounded-xl p-5 border border-white/10 hover:border-primary-500/30 transition-all flex items-center gap-3">
                <span className="text-3xl">▶️</span>
                <span className="text-gray-300 text-sm">Batting Technique Video 2</span>
              </a>
              <a href="https://www.youtube.com/watch?v=0y59UH4HkMc" target="_blank" rel="noopener noreferrer" className="glass rounded-xl p-5 border border-white/10 hover:border-primary-500/30 transition-all flex items-center gap-3">
                <span className="text-3xl">▶️</span>
                <span className="text-gray-300 text-sm">Batting Technique Video 3</span>
              </a>
              <a href="https://www.youtube.com/watch?v=dgg0n6Pk_AM" target="_blank" rel="noopener noreferrer" className="glass rounded-xl p-5 border border-white/10 hover:border-primary-500/30 transition-all flex items-center gap-3">
                <span className="text-3xl">▶️</span>
                <span className="text-gray-300 text-sm">Batting Technique Video 4</span>
              </a>
            </div>
          </div>

          {/* DAILY CONDITIONING */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border border-accent-500/20">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Daily Mental Conditioning</h2>
            <div className="space-y-3 text-center text-lg">
              <p className="text-gray-300 italic">Main hamesha run banata hoon.</p>
              <p className="text-gray-300 italic">Main hamesha match jeetata hoon.</p>
              <p className="text-gray-300 italic">I solve the problem in front of me.</p>
              <p className="text-primary-400 font-bold italic">I win every ball.</p>
            </div>
          </div>

          {/* COMING SOON - Personal Player Portal */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8 border-2 border-accent-500/30 text-center">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
              <span className="text-xs font-medium text-accent-400 uppercase tracking-wider">Coming Soon to C3H — The Nets</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Personal Player Reflection Portal</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              Soon, every Challengers CC player will have their own private login to access personalised tools:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left mb-6">
              <div className="glass rounded-xl p-4 border border-white/10">
                <h4 className="text-primary-400 font-bold text-sm mb-2">Personal Reset Card</h4>
                <p className="text-gray-500 text-xs">Fill in your mindset word, strengths, and pressure response. Saved to your profile.</p>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <h4 className="text-accent-400 font-bold text-sm mb-2">Post-Innings Reflection</h4>
                <p className="text-gray-500 text-xs">Checklists for how you got out, what worked, what to change. Track patterns over time.</p>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <h4 className="text-blue-400 font-bold text-sm mb-2">KPI Tracker</h4>
                <p className="text-gray-500 text-xs">Log runs per 10 balls, intent score, and dot ball % after every innings.</p>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <h4 className="text-purple-400 font-bold text-sm mb-2">Visual Mind Map</h4>
                <p className="text-gray-500 text-xs">Your personal batting blueprint with phases, shot map, and pre-ball routine.</p>
              </div>
            </div>
            <a href="/c3h" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105">
              Learn More About C3H
            </a>
          </div>

          {/* Final Quote */}
          <div className="text-center mb-8">
            <div className="glass rounded-2xl p-8 md:p-12 border border-primary-500/20">
              <p className="text-2xl md:text-3xl font-bold text-white mb-4">
                &quot;I play with presence. I trust my rhythm. This is a command. Now I go win — one ball at a time.&quot;
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
