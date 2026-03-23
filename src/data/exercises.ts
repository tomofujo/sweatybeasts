import type { Exercise } from '../types';

export const builtInExercises: Exercise[] = [
  // ─── Chest ───────────────────────────────────────────────────────────────────

  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders', 'Arms'],
    equipment: 'Barbell',
    description:
      'A foundational compound pressing movement that targets the pectorals. Widely regarded as one of the most effective exercises for building upper-body strength.',
    instructions: [
      'Lie flat on the bench with your eyes beneath the bar and feet firmly on the floor.',
      'Grip the bar slightly wider than shoulder width and unrack it with straight arms.',
      'Lower the bar under control to your mid-chest, keeping your elbows at roughly 45 degrees.',
      'Press the bar back up to full lockout, driving through your chest and triceps.',
    ],
    isCustom: false,
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders', 'Arms'],
    equipment: 'Dumbbell',
    description:
      'An incline pressing variation that emphasises the upper chest fibres. The use of dumbbells allows for a greater range of motion than the barbell equivalent.',
    instructions: [
      'Set the bench to a 30–45 degree incline and sit back with a dumbbell in each hand at shoulder height.',
      'Press the dumbbells upward until your arms are fully extended, without locking out aggressively.',
      'Lower the weights slowly to the sides of your upper chest, feeling a stretch across the pectorals.',
      'Repeat for the prescribed number of repetitions, keeping your back flat against the bench throughout.',
    ],
    isCustom: false,
  },
  {
    id: 'cable-fly',
    name: 'Cable Fly',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Cable',
    description:
      'An isolation exercise that provides constant tension on the chest throughout the entire range of motion. Excellent for developing the inner chest.',
    instructions: [
      'Set both cable pulleys to shoulder height and grasp a handle in each hand.',
      'Step forward into a staggered stance and extend your arms out to the sides with a slight bend in the elbows.',
      'Bring your hands together in a wide arc in front of your chest, squeezing the pectorals at the peak.',
      'Slowly return to the starting position under control, allowing a full stretch.',
    ],
    isCustom: false,
  },
  {
    id: 'dips-chest',
    name: 'Dips (Chest Variant)',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders', 'Arms'],
    equipment: 'Bodyweight',
    description:
      'A bodyweight compound movement that heavily loads the lower chest when performed with a forward lean. Also develops the triceps and front deltoids.',
    instructions: [
      'Grip the parallel bars and lift yourself to a straight-arm position.',
      'Lean your torso forward at roughly 30 degrees and tuck your knees slightly behind you.',
      'Lower yourself until your upper arms are at least parallel to the floor, keeping your elbows flared slightly outward.',
      'Press back up to the starting position by driving through your palms.',
    ],
    isCustom: false,
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders', 'Arms', 'Core'],
    equipment: 'Bodyweight',
    description:
      'The quintessential bodyweight pressing exercise. It builds chest, shoulder and tricep strength and can be performed virtually anywhere.',
    instructions: [
      'Place your hands on the floor slightly wider than shoulder width, with your body forming a straight line from head to heels.',
      'Brace your core and lower your chest towards the floor by bending your elbows.',
      'Descend until your chest is just above the ground, keeping your elbows at roughly 45 degrees.',
      'Push back up to the starting position, fully extending your arms.',
    ],
    isCustom: false,
  },

  // ─── Back ────────────────────────────────────────────────────────────────────

  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'Back',
    secondaryMuscles: ['Legs', 'Core'],
    equipment: 'Barbell',
    description:
      'A fundamental compound lift that develops the entire posterior chain. It is one of the best exercises for overall strength and muscle mass.',
    instructions: [
      'Stand with your feet hip-width apart, the bar over your mid-foot, and grip it just outside your knees.',
      'Drop your hips, brace your core, and flatten your back so your shoulders are slightly in front of the bar.',
      'Drive through the floor, extending your hips and knees simultaneously to lift the bar.',
      'Stand fully upright, squeeze your glutes at the top, then reverse the movement to return the bar to the floor.',
    ],
    isCustom: false,
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    muscleGroup: 'Back',
    secondaryMuscles: ['Arms'],
    equipment: 'Bodyweight',
    description:
      'A classic upper-body pulling exercise that primarily targets the latissimus dorsi. Grip width and hand position can shift emphasis across the back muscles.',
    instructions: [
      'Hang from a pull-up bar with an overhand grip slightly wider than shoulder width and arms fully extended.',
      'Retract your shoulder blades and pull yourself upward, driving your elbows down towards your hips.',
      'Continue until your chin clears the bar, pausing briefly at the top.',
      'Lower yourself under control back to a full dead hang.',
    ],
    isCustom: false,
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    muscleGroup: 'Back',
    secondaryMuscles: ['Arms', 'Core'],
    equipment: 'Barbell',
    description:
      'A heavy compound rowing movement that builds thickness across the entire back. It also strengthens the spinal erectors and biceps.',
    instructions: [
      'Stand with feet hip-width apart, hinge at the hips until your torso is roughly 45 degrees to the floor, and grip the bar just outside your knees.',
      'Brace your core and row the bar towards your lower ribcage, squeezing your shoulder blades together.',
      'Hold the contraction briefly at the top of the movement.',
      'Lower the bar under control until your arms are fully extended, then repeat.',
    ],
    isCustom: false,
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    secondaryMuscles: ['Arms'],
    equipment: 'Cable',
    description:
      'A machine-based horizontal rowing exercise that maintains constant tension on the mid-back. It is excellent for developing rhomboid and mid-trapezius thickness.',
    instructions: [
      'Sit on the row station with your feet on the foot plates, knees slightly bent, and grasp the handle with both hands.',
      'Sit tall with your chest lifted and pull the handle towards your lower sternum, driving your elbows straight back.',
      'Squeeze your shoulder blades together at the peak of the contraction.',
      'Slowly extend your arms back to the starting position without rounding your lower back.',
    ],
    isCustom: false,
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    secondaryMuscles: ['Arms'],
    equipment: 'Cable',
    description:
      'A cable-based vertical pulling exercise that closely mimics the pull-up. It allows precise load selection, making it ideal for all ability levels.',
    instructions: [
      'Sit at the pulldown station and secure your thighs under the pads. Grip the bar wider than shoulder width with an overhand grip.',
      'Lean back slightly and pull the bar down towards your upper chest, leading with your elbows.',
      'Squeeze your lats hard at the bottom of the movement.',
      'Slowly return the bar to the top, allowing a full stretch through your lats before repeating.',
    ],
    isCustom: false,
  },
  {
    id: 'single-arm-dumbbell-row',
    name: 'Single-Arm Dumbbell Row',
    muscleGroup: 'Back',
    secondaryMuscles: ['Arms', 'Core'],
    equipment: 'Dumbbell',
    description:
      'A unilateral rowing movement that helps identify and correct strength imbalances between sides. The bench support reduces lower-back strain.',
    instructions: [
      'Place one knee and the same-side hand on a flat bench, keeping your back flat and parallel to the floor.',
      'Hold a dumbbell in the free hand with your arm hanging straight down.',
      'Row the dumbbell up towards your hip, keeping your elbow close to your body and squeezing your shoulder blade back.',
      'Lower the weight under control and complete all repetitions before switching sides.',
    ],
    isCustom: false,
  },

  // ─── Shoulders ───────────────────────────────────────────────────────────────

  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Arms', 'Core'],
    equipment: 'Barbell',
    description:
      'A standing barbell press that is one of the best measures of upper-body pressing strength. It targets all three deltoid heads with emphasis on the anterior fibres.',
    instructions: [
      'Unrack the barbell at collar-bone height with a grip just outside shoulder width.',
      'Brace your core, squeeze your glutes, and press the bar straight overhead.',
      'Lock out your arms at the top and push your head slightly forward so the bar is directly over your mid-foot.',
      'Lower the bar back to the starting position under control and repeat.',
    ],
    isCustom: false,
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    muscleGroup: 'Shoulders',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    description:
      'An isolation exercise that targets the lateral (side) deltoid head. It is essential for building wider-looking shoulders.',
    instructions: [
      'Stand upright with a dumbbell in each hand at your sides, palms facing inward.',
      'With a slight bend in your elbows, raise both arms out to the sides until they reach shoulder height.',
      'Pause briefly at the top, ensuring your little finger is slightly higher than your thumb.',
      'Lower the dumbbells slowly back to your sides and repeat.',
    ],
    isCustom: false,
  },
  {
    id: 'face-pull',
    name: 'Face Pull',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Back'],
    equipment: 'Cable',
    description:
      'A rear-deltoid and upper-back exercise performed on a cable machine. It is invaluable for shoulder health, posture, and balancing pressing-dominant programmes.',
    instructions: [
      'Set a cable pulley to upper-chest height and attach a rope handle.',
      'Grip the rope with both hands using a neutral grip, step back, and extend your arms in front of you.',
      'Pull the rope towards your face, separating the ends as your hands pass either side of your ears.',
      'Squeeze your rear deltoids and upper back, then return to the start position under control.',
    ],
    isCustom: false,
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Arms'],
    equipment: 'Dumbbell',
    description:
      'A rotational pressing movement popularised by Arnold Schwarzenegger. The rotation engages all three deltoid heads through a single fluid motion.',
    instructions: [
      'Sit on an upright bench holding two dumbbells at shoulder height with your palms facing you.',
      'Begin pressing the dumbbells overhead while simultaneously rotating your wrists so your palms face forward at the top.',
      'Lock out at the top with your biceps close to your ears.',
      'Reverse the rotation as you lower the dumbbells back to the starting position.',
    ],
    isCustom: false,
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Back'],
    equipment: 'Dumbbell',
    description:
      'An isolation exercise that targets the posterior deltoid. It helps counteract the effects of prolonged sitting and pressing-heavy training.',
    instructions: [
      'Hinge forward at the hips until your torso is nearly parallel to the floor, holding a dumbbell in each hand.',
      'Let the dumbbells hang directly below your shoulders with a slight bend in your elbows.',
      'Raise both arms out to the sides in a wide arc, squeezing your rear deltoids at the top.',
      'Lower the dumbbells back to the starting position with control and repeat.',
    ],
    isCustom: false,
  },

  // ─── Legs ────────────────────────────────────────────────────────────────────

  {
    id: 'squat',
    name: 'Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core'],
    equipment: 'Barbell',
    description:
      'Often called the king of all exercises, the barbell back squat develops the quadriceps, glutes and entire lower body. It also demands significant core stability.',
    instructions: [
      'Position the bar across your upper traps, unrack it, and step back with feet roughly shoulder-width apart.',
      'Brace your core, push your hips back and bend your knees to descend until your hip crease drops below the top of your knees.',
      'Drive through your whole foot to stand back up, keeping your chest lifted throughout.',
      'Lock out your hips and knees at the top before beginning the next repetition.',
    ],
    isCustom: false,
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Back', 'Core'],
    equipment: 'Barbell',
    description:
      'A hip-hinge variation that heavily targets the hamstrings and glutes. Unlike the conventional deadlift, the bar does not return to the floor between repetitions.',
    instructions: [
      'Hold a barbell at hip height with a shoulder-width overhand grip and a slight bend in your knees.',
      'Hinge at the hips, pushing them back while lowering the bar along the front of your legs.',
      'Descend until you feel a deep stretch in your hamstrings, keeping the bar close to your body.',
      'Drive your hips forward to return to standing, squeezing your glutes at the top.',
    ],
    isCustom: false,
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'Legs',
    secondaryMuscles: [],
    equipment: 'Machine',
    description:
      'A machine-based compound leg exercise that allows heavy loading without the spinal demands of a squat. Foot placement can shift emphasis between the quadriceps and glutes.',
    instructions: [
      'Sit in the leg press machine with your back flat against the pad and feet shoulder-width apart on the platform.',
      'Release the safety catches and lower the platform by bending your knees towards your chest.',
      'Descend until your knees reach approximately 90 degrees without letting your lower back lift off the pad.',
      'Press the platform back up by extending your legs, stopping just short of full lockout.',
    ],
    isCustom: false,
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    muscleGroup: 'Legs',
    secondaryMuscles: [],
    equipment: 'Machine',
    description:
      'An isolation exercise for the hamstrings performed on a dedicated machine. It targets knee flexion, which complements hip-dominant movements like the Romanian deadlift.',
    instructions: [
      'Lie face down on the leg curl machine and position the pad just above your ankles.',
      'Curl the weight upward by bending your knees, bringing your heels towards your glutes.',
      'Squeeze your hamstrings hard at the top of the movement.',
      'Lower the weight slowly back to the start, maintaining tension throughout.',
    ],
    isCustom: false,
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    muscleGroup: 'Legs',
    secondaryMuscles: [],
    equipment: 'Machine',
    description:
      'An isolation exercise for the quadriceps performed on a machine. It is particularly useful for warming up the knees and achieving a strong quad contraction.',
    instructions: [
      'Sit on the leg extension machine with your back against the pad and the roller pad resting on your shins just above your ankles.',
      'Extend your legs by straightening your knees until your legs are fully locked out.',
      'Squeeze your quadriceps at the top and hold briefly.',
      'Lower the weight back under control without letting the stack touch down between repetitions.',
    ],
    isCustom: false,
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core'],
    equipment: 'Dumbbell',
    description:
      'A unilateral leg exercise that develops single-leg strength, balance, and hip mobility. It is highly effective for correcting left-to-right imbalances.',
    instructions: [
      'Stand about two feet in front of a bench and place the top of one foot on the bench behind you.',
      'Hold a dumbbell in each hand at your sides.',
      'Lower your back knee towards the floor by bending your front leg until your front thigh is roughly parallel to the ground.',
      'Drive through your front heel to return to standing, then complete all repetitions before switching legs.',
    ],
    isCustom: false,
  },
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core'],
    equipment: 'Barbell',
    description:
      'A glute-focused exercise that drives hip extension against resistance. It is one of the most effective movements for developing maximal glute strength and size.',
    instructions: [
      'Sit on the floor with your upper back against a bench and a loaded barbell across your hips.',
      'Place your feet flat on the floor, roughly hip-width apart, with your knees bent at 90 degrees at the top.',
      'Drive through your heels and thrust your hips upward until your torso is parallel to the floor.',
      'Squeeze your glutes hard at the top, then lower your hips back down under control.',
    ],
    isCustom: false,
  },
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    muscleGroup: 'Legs',
    secondaryMuscles: [],
    equipment: 'Machine',
    description:
      'An isolation exercise for the gastrocnemius and soleus muscles of the calf. Consistent training with a full range of motion is key to calf development.',
    instructions: [
      'Stand on the edge of a calf raise platform with the balls of your feet on the ledge and your heels hanging off.',
      'Lower your heels as far as possible to achieve a full stretch in the calves.',
      'Rise up onto your toes as high as you can, squeezing your calves at the top.',
      'Pause briefly, then lower back down under control and repeat.',
    ],
    isCustom: false,
  },

  // ─── Arms ────────────────────────────────────────────────────────────────────

  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    muscleGroup: 'Arms',
    secondaryMuscles: [],
    equipment: 'Barbell',
    description:
      'The staple bicep exercise that allows heavier loading than dumbbell alternatives. It builds overall bicep mass and peak.',
    instructions: [
      'Stand upright holding a barbell with an underhand, shoulder-width grip and arms fully extended.',
      'Keeping your elbows pinned to your sides, curl the bar upward towards your shoulders.',
      'Squeeze your biceps at the top of the movement.',
      'Lower the bar back to full extension under control, avoiding any swinging.',
    ],
    isCustom: false,
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    muscleGroup: 'Arms',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    description:
      'A neutral-grip curl variation that targets the brachialis and brachioradialis in addition to the biceps. It contributes to overall arm thickness.',
    instructions: [
      'Stand upright with a dumbbell in each hand, arms at your sides and palms facing inward (neutral grip).',
      'Curl both dumbbells upward simultaneously without rotating your wrists.',
      'Squeeze at the top when the dumbbells reach shoulder height.',
      'Lower the weights back to the starting position under control.',
    ],
    isCustom: false,
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crusher',
    muscleGroup: 'Arms',
    secondaryMuscles: [],
    equipment: 'Barbell',
    description:
      'A lying tricep extension that isolates all three heads of the triceps. It is one of the most effective mass-building movements for the upper arm.',
    instructions: [
      'Lie on a flat bench holding an EZ-bar or straight bar with a narrow overhand grip, arms extended above your chest.',
      'Keeping your upper arms stationary, bend your elbows to lower the bar towards your forehead.',
      'Descend until the bar is just above your forehead or slightly behind it.',
      'Extend your arms back to the starting position by contracting your triceps.',
    ],
    isCustom: false,
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    muscleGroup: 'Arms',
    secondaryMuscles: [],
    equipment: 'Cable',
    description:
      'A cable isolation exercise for the triceps. The constant tension from the cable makes it particularly effective for achieving a strong contraction.',
    instructions: [
      'Stand facing a high cable pulley with a straight bar or rope attachment.',
      'Grip the handle with your elbows bent at 90 degrees and tucked into your sides.',
      'Push the handle downward by extending your elbows until your arms are fully straight.',
      'Slowly allow the handle to return to the 90-degree position, keeping your elbows stationary throughout.',
    ],
    isCustom: false,
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    muscleGroup: 'Arms',
    secondaryMuscles: [],
    equipment: 'Barbell',
    description:
      'A bicep curl performed on an angled pad that eliminates momentum and strictly isolates the biceps. It places particular emphasis on the lower portion of the muscle.',
    instructions: [
      'Sit at a preacher bench and rest the backs of your upper arms on the pad, holding a barbell or EZ-bar with an underhand grip.',
      'Starting from full arm extension, curl the bar upward towards your shoulders.',
      'Squeeze your biceps at the top of the movement.',
      'Lower the bar slowly back to near-full extension, maintaining tension on the biceps throughout.',
    ],
    isCustom: false,
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    muscleGroup: 'Arms',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    description:
      'An overhead extension that stretches the long head of the triceps under load. This makes it uniquely effective for developing the inner portion of the upper arm.',
    instructions: [
      'Sit or stand upright and hold a single dumbbell overhead with both hands, gripping the inside of the upper weight plate.',
      'Keeping your upper arms close to your ears, lower the dumbbell behind your head by bending your elbows.',
      'Descend until your forearms are at least parallel to the floor.',
      'Extend your arms back overhead by contracting your triceps, locking out at the top.',
    ],
    isCustom: false,
  },

  // ─── Core ────────────────────────────────────────────────────────────────────

  {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'Core',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Bodyweight',
    description:
      'An isometric core stabilisation exercise that builds endurance in the abdominals, obliques, and lower back. It also reinforces proper spinal alignment.',
    instructions: [
      'Place your forearms on the floor with your elbows directly beneath your shoulders.',
      'Extend your legs behind you so your body forms a straight line from head to heels.',
      'Brace your core, squeeze your glutes, and hold the position for the prescribed duration.',
      'Avoid letting your hips sag or pike upward throughout the hold.',
    ],
    isCustom: false,
  },
  {
    id: 'ab-wheel',
    name: 'Ab Wheel',
    muscleGroup: 'Core',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Other',
    description:
      'An advanced core exercise that challenges anti-extension strength. It is one of the most demanding abdominal movements when performed through a full range of motion.',
    instructions: [
      'Kneel on the floor and grip the ab wheel handles with both hands, positioning it directly below your shoulders.',
      'Brace your core and slowly roll the wheel forward, extending your body towards the floor.',
      'Extend as far as you can while maintaining a flat back and engaged core.',
      'Pull the wheel back towards your knees by contracting your abdominals, returning to the starting position.',
    ],
    isCustom: false,
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'Core',
    secondaryMuscles: ['Arms'],
    equipment: 'Bodyweight',
    description:
      'A challenging core exercise performed from a dead hang. It develops the lower abdominals and hip flexors while also building grip strength.',
    instructions: [
      'Hang from a pull-up bar with an overhand grip and arms fully extended.',
      'Keeping your legs straight, raise them in front of you until they are parallel to the floor or higher.',
      'Pause briefly at the top, focusing on contracting your abdominals.',
      'Lower your legs under control back to the hanging position without swinging.',
    ],
    isCustom: false,
  },
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    muscleGroup: 'Core',
    secondaryMuscles: [],
    equipment: 'Cable',
    description:
      'A weighted abdominal exercise performed on a cable machine. The adjustable resistance makes it easy to progressively overload the abdominals.',
    instructions: [
      'Kneel facing a high cable pulley and hold a rope attachment behind your head.',
      'Keeping your hips stationary, crunch downward by flexing your spine and bringing your elbows towards your knees.',
      'Squeeze your abdominals hard at the bottom of the movement.',
      'Slowly return to the upright kneeling position under control.',
    ],
    isCustom: false,
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    muscleGroup: 'Core',
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    description:
      'A rotational core exercise that targets the obliques. It can be performed with bodyweight alone or with a weight plate, dumbbell, or medicine ball for added resistance.',
    instructions: [
      'Sit on the floor with your knees bent and feet flat (or raised for added difficulty). Lean back slightly so your torso is at roughly 45 degrees.',
      'Clasp your hands together or hold a weight at chest height.',
      'Rotate your torso to one side, bringing your hands towards the floor beside your hip.',
      'Rotate through the centre to the opposite side in a controlled manner. Each rotation to both sides counts as one repetition.',
    ],
    isCustom: false,
  },

  // ─── Chest (additional) ──────────────────────────────────────────────────────

  {
    id: 'pec-deck',
    name: 'Pec Deck',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Machine',
    description:
      'A machine isolation exercise that targets the pectorals through a wide arc. The fixed movement path makes it excellent for beginners and for finishing sets when fatigue limits stabiliser performance.',
    instructions: [
      'Sit upright in the pec deck machine and adjust the seat so your arms are parallel to the floor.',
      'Place your forearms against the pads with elbows bent at roughly 90 degrees.',
      'Squeeze your chest to bring the pads together in front of you.',
      'Pause at the peak contraction, then slowly return to the start, allowing a full stretch across the chest.',
    ],
    isCustom: false,
  },

  // ─── Legs (additional) ───────────────────────────────────────────────────────

  {
    id: 'walking-lunges',
    name: 'Walking Lunges',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core'],
    equipment: 'Dumbbell',
    description:
      'A unilateral lower-body movement that combines a lunge with forward locomotion. It develops quad and glute strength, balance, and coordination across a full range of motion.',
    instructions: [
      'Stand tall with a dumbbell in each hand (or hands on hips for bodyweight), feet together.',
      'Step forward with one leg and lower your back knee towards the floor, keeping your torso upright.',
      'Descend until your front thigh is roughly parallel to the floor.',
      'Drive through your front heel and bring your rear foot forward to stand, immediately stepping into the next lunge.',
    ],
    isCustom: false,
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core', 'Back'],
    equipment: 'Barbell',
    description:
      'A barbell squat with the bar held across the front deltoids. The front-loaded position demands greater upper-back and core bracing and places more emphasis on the quadriceps than the back squat.',
    instructions: [
      'Rest the bar on your front deltoids with your elbows high and parallel to the floor, using either a clean grip or crossed-arm grip.',
      'Unrack the bar and step back with feet shoulder-width apart, toes turned out slightly.',
      'Brace your core, keep your elbows up, and squat down until your hip crease drops below your knees.',
      'Drive through your whole foot to stand, maintaining an upright torso throughout.',
    ],
    isCustom: false,
  },

  // ─── Shoulders (additional) ──────────────────────────────────────────────────

  {
    id: 'landmine-press',
    name: 'Landmine Press',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Chest', 'Arms', 'Core'],
    equipment: 'Barbell',
    description:
      'A single-arm pressing movement using a barbell anchored at one end. The arc of motion places less stress on the shoulder joint than a strict overhead press, making it a great option for those with mobility restrictions.',
    instructions: [
      'Anchor one end of a barbell in a landmine attachment or a corner. Stand facing the barbell and grasp the loaded end with one hand at shoulder height.',
      'Set your feet staggered for stability and brace your core.',
      'Press the bar upward and slightly forward along its natural arc until your arm is fully extended.',
      'Lower the bar back to shoulder height under control and complete all repetitions before switching sides.',
    ],
    isCustom: false,
  },
  {
    id: 'upright-row',
    name: 'Upright Row',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Back', 'Arms'],
    equipment: 'Barbell',
    description:
      'A vertical pulling exercise that develops the lateral deltoids and upper trapezius. Keeping a wider grip reduces internal shoulder rotation and makes the movement more comfortable.',
    instructions: [
      'Stand holding a barbell with an overhand grip, hands slightly narrower than shoulder width, arms hanging in front of your thighs.',
      'Pull the bar upward along your body, leading with your elbows, until the bar reaches chin height.',
      'Keep your elbows higher than your wrists throughout the movement.',
      'Lower the bar back to the starting position under control and repeat.',
    ],
    isCustom: false,
  },
  {
    id: 'six-way-lat-raise',
    name: '6-Way Lat Raise',
    muscleGroup: 'Shoulders',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    description:
      'A shoulder circuit combining front raise, lateral raise, and rear-delt raise into one flowing sequence. It hits all three deltoid heads and the rotator cuff in a single set.',
    instructions: [
      'Stand holding light dumbbells at your sides.',
      'Raise both arms directly in front of you to shoulder height (front raise), then lower.',
      'Raise both arms out to the sides to shoulder height (lateral raise), then lower.',
      'Hinge slightly at the hips and raise both arms out to the rear to shoulder height (rear raise), then lower.',
      'That completes one full repetition — maintain smooth, controlled movement throughout.',
    ],
    isCustom: false,
  },

  // ─── Back (additional) ───────────────────────────────────────────────────────

  {
    id: 'landmine-row',
    name: 'Landmine Row',
    muscleGroup: 'Back',
    secondaryMuscles: ['Arms', 'Core'],
    equipment: 'Barbell',
    description:
      'A supported rowing variation using a landmine setup. The angled pull path is easier on the lower back than a free-weight row and allows a strong lat contraction at the end of the movement.',
    instructions: [
      'Anchor one end of a barbell in a landmine attachment. Stand over the bar in a hinged position with a neutral spine, gripping the loaded end with both hands or a single handle.',
      'Let the bar hang at full arm extension below your chest.',
      'Row the bar upward towards your lower sternum, driving your elbows back and squeezing your shoulder blades together.',
      'Lower the bar back to the starting position under control and repeat.',
    ],
    isCustom: false,
  },
  {
    id: 'shrugs',
    name: 'Shrugs',
    muscleGroup: 'Back',
    secondaryMuscles: [],
    equipment: 'Barbell',
    description:
      'An isolation exercise for the upper trapezius. Shrugs allow very heavy loading and are one of the few direct movements for developing trap thickness and the "yoke" look.',
    instructions: [
      'Stand holding a barbell (or dumbbells) in front of your thighs with an overhand grip, arms fully extended.',
      'Keeping your arms straight, elevate your shoulders as high as possible towards your ears.',
      'Hold the peak contraction for a moment, then lower your shoulders back down fully.',
      'Avoid rolling your shoulders — move them straight up and down.',
    ],
    isCustom: false,
  },

  // ─── Full Body ───────────────────────────────────────────────────────────────

  {
    id: 'power-clean',
    name: 'Power Clean',
    muscleGroup: 'Full Body',
    secondaryMuscles: ['Legs', 'Back', 'Shoulders'],
    equipment: 'Barbell',
    description:
      'An explosive Olympic lifting derivative that develops power, coordination, and athleticism. It trains the ability to generate force rapidly from the floor to the shoulders.',
    instructions: [
      'Stand with feet hip-width apart, the bar over your mid-foot, and grip it just outside your knees with an overhand grip.',
      'Lift the bar to just above your knees by extending your legs, keeping your back flat and chest up.',
      'Explosively extend your hips, knees, and ankles (the triple extension) to accelerate the bar upward.',
      'Drop under the bar by rotating your elbows forward and catch it across the front of your shoulders in a quarter-squat position.',
      'Stand up to complete the lift.',
    ],
    isCustom: false,
  },
  {
    id: 'kettlebell-swing',
    name: 'Kettlebell Swing',
    muscleGroup: 'Full Body',
    secondaryMuscles: ['Legs', 'Back', 'Core'],
    equipment: 'Kettlebell',
    description:
      'A ballistic hip-hinge movement that builds posterior-chain power and cardiovascular conditioning. It is a cornerstone of kettlebell training.',
    instructions: [
      'Stand with feet slightly wider than shoulder width, holding a kettlebell with both hands in front of you.',
      'Hinge at the hips, swinging the kettlebell back between your legs while keeping your back flat.',
      'Explosively drive your hips forward to propel the kettlebell up to chest or eye height.',
      'Let the kettlebell swing back between your legs under control and repeat in a continuous rhythm.',
    ],
    isCustom: false,
  },
  {
    id: 'turkish-get-up',
    name: 'Turkish Get-Up',
    muscleGroup: 'Full Body',
    secondaryMuscles: ['Shoulders', 'Core', 'Legs'],
    equipment: 'Kettlebell',
    description:
      'A slow, deliberate full-body movement that transitions from lying to standing while holding a weight overhead. It builds stability, mobility, and total-body coordination.',
    instructions: [
      'Lie on your back holding a kettlebell in one hand with your arm extended straight above your shoulder. Bend the knee on the same side.',
      'Roll onto your opposite elbow, then press up onto your hand while keeping the kettlebell locked out overhead.',
      'Sweep your straight leg underneath you into a kneeling position.',
      'From the kneeling position, stand up fully while keeping the kettlebell stable overhead.',
      'Reverse each step to return to the lying position under control.',
    ],
    isCustom: false,
  },
  {
    id: 'clean-and-jerk',
    name: 'Clean and Jerk',
    muscleGroup: 'Full Body',
    secondaryMuscles: ['Legs', 'Back', 'Shoulders', 'Arms'],
    equipment: 'Barbell',
    description:
      'One of the two competition lifts in Olympic weightlifting. It demands strength, speed, and technical precision to move a barbell from the floor to overhead.',
    instructions: [
      'Set up as for a power clean: feet hip-width apart, bar over mid-foot, overhand grip just outside the knees.',
      'Clean the bar to your shoulders by explosively extending your hips and catching the bar in a front-rack position.',
      'Stand up fully from the catch, reset your feet, and take a breath.',
      'Dip slightly at the knees, then drive the bar overhead by extending your legs and pressing simultaneously, splitting or pushing your feet apart to catch the bar at full lockout.',
      'Bring your feet together and stand upright to complete the lift.',
    ],
    isCustom: false,
  },
];
