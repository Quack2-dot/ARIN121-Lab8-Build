import { PresetTopic } from '../types';

export const SAMPLE_STUDY_MATERIALS: PresetTopic[] = [
  {
    id: 'biology',
    title: 'Cellular Respiration & ATP Synthase',
    faculty: 'Biological Sciences (BIOL 101)',
    icon: '🧬',
    snippet: 'Glycolysis, Krebs Cycle, oxidative phosphorylation, and the proton-motive force.',
    content: `Cellular Respiration and ATP Generation
Course: BIOL 101 - Principles of Biology

1. Overview:
Cellular respiration is the catabolic pathway by which organic molecules are broken down to release energy for the synthesis of adenosine triphosphate (ATP). The overall chemical equation is:
C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ~30-32 ATP.

2. Stage 1: Glycolysis
- Location: Cytoplasm (cytosol).
- Anaerobic: Does not require molecular oxygen.
- Reactant: 1 molecule of glucose (6 carbons).
- Products: 2 molecules of pyruvate (3 carbons each), a net yield of 2 ATP (generated via substrate-level phosphorylation), and 2 NADH.

3. Stage 2: Pyruvate Oxidation and the Citric Acid (Krebs) Cycle
- Location: Mitochondrial matrix.
- Pyruvate is converted to acetyl-CoA, releasing 1 CO2 and producing 1 NADH per pyruvate.
- Acetyl-CoA enters the Citric Acid Cycle, combining with oxaloacetate to form citrate.
- For each turn of the cycle (2 turns per glucose), the products are 2 CO2, 3 NADH, 1 FADH2, and 1 ATP/GTP.

4. Stage 3: Oxidative Phosphorylation
- Location: Inner mitochondrial membrane (cristae).
- Consists of two coupled phases: the Electron Transport Chain (ETC) and Chemiosmosis.
- The ETC transfers electrons from NADH and FADH2 through four protein complexes (I, II, III, IV) to oxygen, the terminal electron acceptor, forming water.
- As electrons move down the ETC, protons (H+) are actively pumped from the mitochondrial matrix into the intermembrane space, creating a steep electrochemical proton gradient (proton-motive force).
- Chemiosmosis: Protons flow back into the matrix through ATP synthase, a rotary enzyme that catalyzes the phosphorylation of ADP + Pi into ATP. This accounts for approximately 26-28 ATP per glucose molecule.`,
  },
  {
    id: 'psychology',
    title: 'Classical vs. Operant Conditioning',
    faculty: 'Psychological Science (PSYC 204)',
    icon: '🧠',
    snippet: 'Pavlovian stimulus association vs. Skinnerian reinforcement and punishment schedules.',
    content: `Behavioral Learning Theory: Conditioning Paradigms
Course: PSYC 204 - Cognitive & Behavioral Psychology

1. Classical Conditioning (Pavlovian):
- Definition: A learning process occurring through association between an environmental stimulus and a naturally occurring involuntary reflex.
- Unconditioned Stimulus (UCS): A trigger that automatically elicits a reflexive response (e.g., food presentation).
- Unconditioned Response (UCR): The unlearned, natural response to the UCS (e.g., salivation upon seeing food).
- Conditioned Stimulus (CS): A previously neutral stimulus that, after repeated pairing with the UCS, triggers a conditioned response (e.g., a bell tone).
- Conditioned Response (CR): The learned response to the previously neutral conditioned stimulus (e.g., salivation to the bell).
- Extinction: Occurs when the CS is repeatedly presented without the UCS, causing the CR to gradually diminish.

2. Operant Conditioning (Skinnerian):
- Definition: Learning where voluntary behavior is modified through consequences (reinforcements or punishments).
- Positive Reinforcement: Adding a desirable stimulus following a behavior to increase the likelihood of that behavior recurring (e.g., praise or reward).
- Negative Reinforcement: Removing or terminating an aversive stimulus to increase the target behavior (e.g., fastening a seatbelt to silence the warning beeper). Note: Negative reinforcement is NOT punishment; it strengthens behavior.
- Positive Punishment: Presenting an unpleasant stimulus to decrease a behavior (e.g., assigning extra chores).
- Negative Punishment: Removing a valued stimulus to decrease a behavior (e.g., revoking privileges).

3. Schedules of Reinforcement:
- Fixed-Ratio (FR): Reinforcement delivered after a set number of responses (e.g., payment per 10 items completed). Produces high response rates with post-reinforcement pauses.
- Variable-Ratio (VR): Reinforcement delivered after an unpredictable number of responses (e.g., slot machines). Produces the highest, most resistant-to-extinction response rate.`,
  },
  {
    id: 'computer-science',
    title: 'Object-Oriented Design & Polymorphism',
    faculty: 'Computer Science (CS 210)',
    icon: '💻',
    snippet: 'Encapsulation, inheritance, static vs. dynamic dispatch, and interface segregation.',
    content: `Object-Oriented Programming & Architecture
Course: CS 210 - Software Engineering & Paradigms

1. The Four Core OOP Pillars:
- Encapsulation: Bundling data (attributes) and methods that operate on that data into a single unit (class), while restricting direct access to internal state using private/protected access modifiers to prevent unintended external coupling.
- Abstraction: Hiding implementation complexity behind a simplified interface. Consumers interact with what an object does, rather than how it achieves it.
- Inheritance: The mechanism where a derived child class inherits fields and behaviors from a base parent class, promoting code reuse and forming 'is-a' relationships.
- Polymorphism: The capability of different classes to respond to the same method invocation in their own specific way ('many forms').

2. Static vs. Dynamic Polymorphism:
- Compile-time (Static) Polymorphism: Method overloading (same method name, different parameter types or counts within the same scope) and operator overloading. Resolved during compilation.
- Runtime (Dynamic) Polymorphism: Method overriding, where a subclass provides a specific implementation of a virtual/abstract method declared in its superclass. Resolved at runtime using dynamic dispatch (vtable lookup).

3. Composition over Inheritance:
- While inheritance creates tight compile-time coupling ('is-a'), composition creates flexible runtime relationships ('has-a'). Modern architecture favors composition to enable modular component swapping without brittle base-class dependencies.

4. Interface Segregation:
- Clients should not be forced to depend upon methods they do not use. Prefer small, focused interfaces rather than single bloated monolithic interfaces.`,
  },
  {
    id: 'economics',
    title: 'Market Equilibrium, Elasticity & Surplus',
    faculty: 'Economics (ECON 102)',
    icon: '📈',
    snippet: 'Supply and demand curves, price elasticity, consumer surplus, and deadweight loss.',
    content: `Principles of Microeconomics: Markets & Elasticity
Course: ECON 102 - Introductory Microeconomics

1. Law of Demand and Supply:
- Law of Demand: Other things equal (ceteris paribus), as price rises, the quantity demanded falls (downward-sloping curve due to substitution and income effects).
- Law of Supply: Other things equal, as price rises, the quantity supplied rises (upward-sloping curve reflecting increasing marginal cost of production).
- Market Equilibrium: The intersection where quantity supplied equals quantity demanded (Qs = Qd). The clearing price eliminates shortage and surplus.

2. Price Elasticity of Demand (PED):
- Formula: PED = (% change in Quantity Demanded) / (% change in Price).
- Perfectly Inelastic (PED = 0): Quantity demanded does not change at all with price changes (vertical demand curve, e.g., lifesaving insulin).
- Inelastic (0 < |PED| < 1): Percentage change in quantity is smaller than percentage change in price. An increase in price causes total revenue (P x Q) to increase.
- Unit Elastic (|PED| = 1): Percentage changes are identical; total revenue remains constant.
- Elastic (|PED| > 1): Percentage change in quantity exceeds percentage change in price. A price cut increases total revenue.

3. Consumer Surplus, Producer Surplus & Deadweight Loss:
- Consumer Surplus: The difference between the maximum amount a consumer is willing to pay and the market price actually paid.
- Producer Surplus: The difference between the actual price received and the minimum price at which the seller is willing to supply.
- Deadweight Loss (DWL): The net loss of total economic surplus caused by market distortions, such as price ceilings, price floors, monopolies, or taxes that prevent mutually beneficial trades from occurring.`,
  },
];
