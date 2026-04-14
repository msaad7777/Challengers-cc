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

        </div>
      </section>

      <Footer />
    </div>
  );
}
