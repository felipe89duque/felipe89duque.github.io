**How far do voltages spread without an action potential?**

From the experiments in this tutorial on the passive decay of a voltage along an axon illustrated in the diagram below, you will be able to appreciate the necessity for a mechanism to enhance the voltage spread. Nature discovered voltage-sensitive ion channels and with them was able not only to enhance voltage spread but to generate a signal, the action potential, whose shape and amplitude are maintained with high integrity. 

<!-- This integrity will be clear in the next tutorial on propagation in a uniform unmyelinated axon (Unmyelinated Axon Tutorial). -->

![](../media/passaxon.gif)
**Are there types of neurons in which voltages spread only passively, without action potentials?**

Yes. Two examples in the human body are the rod and cone photoreceptors of the retina, and hair cells—the sensory receptors of the inner ear. These sensory cells are so short that action potentials are not needed to get signals from one end to the other.

## Objectives
* To observe the passive spread of a voltage change along an axon in response to injected current
* To measure the "length constant" of the axon
* To experiment with how membrane resistance and axon diameter affect the passive spread of a voltage
* To investigate whether a change in membrane capacitance affects passive spread
* To observe passive spread when the electrode is located at different positions along this "closed-ends" axon

## Experiments and Observations

**At four locations along the axon, observe voltage responses to the current pulse.**

1. **Depolarize the axon at its left end.** Press *Run simulation* and use the slider to select the speed at which you wish to run this simulation. You will observe the voltage recordings at the four electrodes. How does the rate of rise and the amplitude of the voltage step [change](ans1.md) as you record it farther and farther away from the point of stimulation?

(Note that the voltage change at the recording electrode at the [0.75] position [three-quarters of the way down the axon from the point of stimulation] is too small to be observed at this gain.)

2. **Increase the gain and re-run the simulation.** Look for the *Gain* in the parameter control and increase it before running the simulation again.

When you run the simulation again, you can note more accurately the time of onset of the voltage change as it spreads down the axon. You may be surprised to find that a voltage spreading passively has a delay associated with the attenuation of the voltage signal.

---

<!-- ### Observe a movie of the voltage change as it spreads along the axon.

Call up the Voltage-vs-Space graph.

A unique feature of the NIA tutorials is their ability to show voltages spreading or propagating in the neuron. As you prepare to watch the "movie" on this new graph, remember that the x-axis is now distance, not time.
Press R&R to run the movie.
Here you can appreciate the spread of a voltage change along the passive axon and relate these changes in space to the voltages recorded (as a function of time) at each electrode.

--- -->

### Measure the length constant (L) of the axon.

1. **What is the [length constant](lambda.md)?**

The length constant L is not a physical property of the membrane; it is arbitrarily defined as the distance over which the voltage decays to approximately one-third of its initial value, or, more precisely, to 1/e (0.368) of its initial value:

```
V = (Vo) * (exp[–x/L])
```

To measure it you will have to freeze the voltage decaying over distance (in the next step).

2. **Capture a trace from which you can measure the length constant.** Do this by stopping the simulation when the voltage at the left end (red trace in the Voltage-vs-Time plot) has reached a steady-state (maximum) level while the stimulus is still on. You will then be able to observe that the voltage in the Voltage-vs-Space plot falls off exponentially. A simple way to do this is to set the Total simulation time parameter to 19; this will stop the simulation just before the end of the 20 ms stimulus pulse.
    
3. **Make your measurements.** 
    - Placing the cursor on top of the lines, measure the x and y values on the Voltage-vs-Space graph. 
    - Measure the initial value of the voltage at x = 0.
    - Move the cursor to the voltage at `1/e` (0.36788) of this initial value. The [spatial resolution](spatial_res.md) chosen for this simulation may not allow you to reach your calculated number precisely. Nevertheless, the value of L, which you read nearest to this value, is accurate to within 1%.
    
* **CAUTION!**	The term "length constant" is useful for describing voltage spread in passive processes. But it applies ONLY to membranes that are linear resistances—axons without voltage-sensitive channels, or that are operating in a range where voltage-sensitive channels are not open. When voltage-sensitive channels are active, the current-voltage relation of the membrane is nonlinear and the "length constant" equation and name lose their meaning.

---

### How does the length constant change with membrane resistance?

1. **Bring up the Axon Parameters panel.** The length constant depends on the ratio of the membrane resistance to the axial resistance (resistance of the axoplasm). You can change the membrane's passive resistance by changing leakage conductance in this panel to determine how such changes affect passive decay.

2. **Decrease the membrane resistance.** Decrease the membrane resistance by, say, a factor of four by multiplying its leakage conductance by this factor. Your intuition probably tells you that if the resistance is lower, current will not spread as far down the axon. But how quickly will it decline? It is instructive to actually see this experiment as a movie!

3. **Run the simulation.** What are the new values of the initial voltage, the voltage at `1/e` of the initial voltage, and the length constant? How does this value of length constant [compare](lambda_with_membrane_Res.md) with your original measurement?

If you want instead to *increase* the membrane resistance, the higher membrane resistance will drive your current pulse off scale. 

4. **Reset the leakage conductance to its default value.** 

---

### How does the length constant change with axon diameter?

1. **Change the axial (internal) resistance by changing the diameter.** The axial resistance depends on the specific resistance, or resistivity, of the axoplasm and the diameter of the axon. Again, intuition should tell you that the larger the diameter of the axon, the more easily current will flow along it, and thus the lower the axial resistance will be. Here, you can experiment with changes in diameter to get a feeling for how the voltage spread depends on diameter.

- **Increase the diameter four-fold to 40 μm.** Remember that axons of larger diameter require more current to depolarize them to the same value as that recorded in an axon of smaller diameter (next step).
- **Increase the amplitude of the stimulus current.** We suggest an eight-fold increase to restore the voltage response to approximately the same level.

2. **Run the simulation.** What are the new values of the initial voltage, the voltage at `1/e` of the initial voltage, and the length constant? How does this value of length constant compare with your original measurement? It should be twice as large.

3. **Reset all parameters to their default values.**

---

### Does the length constant change with changes in membrane capacitance?

1. **Why change the capacitance?** There are two cell types in which the capacitance of a cell changes due to cell structure. The first is the myelinated axon, where each unit area of axonal membrane has a considerably lower capacitance due to the membrane wrappings of the myelin (capacitors in series); the second is the muscle fiber, where each unit area of muscle membrane has a six-fold higher capacitance because of the invaginating membrane of the T-tubule system. How do changes in capacitance affect voltage spread in these cells?

2. **Change the capacitance and re-run the simulation.** Change the capacitance by a factor of, say, two. Does the length constant [change](ans2.md)?

3. **Reset the membrane capacitance to its default value.**

---

### Move the stimulating electrode and observe the patterns of voltage spread.

Note that the ends of this axon are "sealed"—that is, they have infinite resistance. The voltage change near the end of an axon is especially affected by the resistance of the end. (This will be obvious when you move the electrode towards an end, as suggested in step #3 below).

1. **Move the electrode (blue ball) to the middle of the axon.** Do this in the Stimulus Control panel by clicking on the midpoint of the line representing the axon. Read the new location of the electrode on the adjacent text field; it should be at the (0.5) position.

2. **Stimulate the axon at its midpoint.** Run the simulation. Note how the voltage spread now [differs](stim_mid.md) from the pattern when the electrode was located at the left end of the axon.

3. **Move the electrode closer to one end than the other, (e.g., 0.25 or 0.75).** Because the axon has been divided into 101 short segments for simulation, you will not be able to locate these points precisely but you can get very close (e.g., 0.252475). Stimulate the cell at this asymmetric point.

Observe the voltage decay away from the the point of current injection in the Voltage-vs-Space plot. The pattern of decay is quite different in the two directions.

4) **Question:** [Why](ans3.md) is there no voltage decay at the very ends of the axon (seen earliest at the end nearest the current injection)?

