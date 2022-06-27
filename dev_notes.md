# todo:
* render minimap
* deploy to workspaces to see how this thing actually works
* come up with a way to run custom queries against the demo
  * and quickly visualize the result
* need to support multiple AIs
  * and ability to inject entitys with specific AIs at runtime

# future iteration is to add warp entities to adjacent solar systems

to generate neighbors, use veroni and connect solar systems on either side of every edge

for connections, consider a new wormholes table to track sid -> sid
then pack all the edges in the current system (similar to neighbors) and pass it
into the step function as another input

alternatively, add a new entity kind and just add the edges directly to the entities table
    this is the easiest solution, but requires improving cleanup routines/development workflow to not delete the wormholes

then the universe map needs to know about the wormholes in order to render edges bewtween each system