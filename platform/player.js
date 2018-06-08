class Player {
	constructor(world, ID, modalysChannel, modalysSessionId, dom_parent, fret) {
		var mirror = true;
        this.avatar = new kinectAvatar(world, 1, true);
        this.guitar = new AirGuitar(world, this.avatar, modalysChannel, modalysSessionId, mirror, ID, fret);
        this.cello = new AirCello(world, this.avatar, mirror, ID);
        this.avatar.addToScene();
        this.ID = ID;
    	this.pitchVolumeOrgan = new PitchVolumeOrgan(world, this.avatar, mirror, ID);
    	this.fret = fret;
    	this.dom_element = `<div class="col"> <div id=${ID} class='card' style='width: 18rem;'>
  <div class='card-body'>
    <h5 class='card-title text-primary'>Player ${ID}</h5>
			<table class="table">
			  <tbody>
				<tr><td>RH: <span id="HR_${ID}"></span> </td></tr>
				<tr><td>RH Vel: <span id="RH_x_vel_${ID}"></span> </td></tr>
				<tr><td>LH: <span id="HL_${ID}"></span></td> </tr>
				<tr><td>Note Index:	<span id="bendQuanto_${ID}"></span></td> </tr> 
			  </tbody>
			</table>
  </div>
</div></div>`;
		dom_parent.append(this.dom_element);
		this.dom_parent = dom_parent;
	}

	removeFromScene() {
		this.guitar.removeFromScene();
		this.cello.removeFromScene();
		this.avatar.removeFromScene();
		$(`#${this.ID}`).remove();
		// this.guitar.dispose(); // we have memory leak for now
		// this.cello.dispose();
		// this.avatar.dispose();
	}

	refreshDOM(data) {
		// refresh html elements
			for (var j = 0; j < data.joints.length; j++) {
				var joint = data.joints[j];
					
				if (joint.name == "HandLeft") {
					var HL_x = joint.x.toPrecision(3);
					var HL_y = joint.y.toPrecision(3);
					var HL_z = joint.z.toPrecision(3);
					$(`#HL_${this.ID}`).html(HL_x + ", " + HL_y + ", " + HL_z);
				}
				else if (joint.name == "HandRight") {
					var HR_x = joint.x.toPrecision(3);
					var HR_y = joint.y.toPrecision(3);
					var HR_z = joint.z.toPrecision(3);
					$(`#HR_${this.ID}`).html(HR_x + ", " + HR_y + ", " + HR_z);
				}										
            }
	}


	refresh(data, mode) {
	//	console.log(data);
		this.avatar.refresh(data);
		this.refreshDOM(data);
		if (mode == 0) {
			if (this.guitar.inScene) {
				this.guitar.removeFromScene();
			}
			if (this.cello.inScene) {
				this.cello.removeFromScene();
			}			
			if (this.pitchVolumeOrgan.inScene) {
				this.pitchVolumeOrgan.removeFromScene();
			}
		}
		if (mode == 1) {
			if (!this.guitar.inScene) {
				this.guitar.addToScene();
			}
			if (this.cello.inScene) {
				this.cello.removeFromScene();
			}
			if (this.pitchVolumeOrgan.inScene) {
				this.pitchVolumeOrgan.removeFromScene();
			}
			this.guitar.refreshGuitar(data.joints[0]);
			this.guitar.refreshSound(data);
		}
		else if (mode == 2) {
			if (this.guitar.inScene) {
				this.guitar.removeFromScene();
			}
			if (!this.cello.inScene) {
				this.cello.addToScene();
			}
			if (this.pitchVolumeOrgan.inScene) {
				this.pitchVolumeOrgan.removeFromScene();
			}
			this.cello.refreshCello(data.joints[0]);
			this.cello.refreshSound(data);			
		}
		else if (mode == 3) {
			if (this.guitar.inScene) {
				this.guitar.removeFromScene();
			}
			if (this.cello.inScene) {
				this.cello.removeFromScene();
			}
			if (!this.pitchVolumeOrgan.inScene) {
				this.pitchVolumeOrgan.addToScene();
			}
			this.pitchVolumeOrgan.refreshOrgan(data.joints[0]);
			this.pitchVolumeOrgan.refreshSound(data);
		}
		this.last_refresh = Date.now();
	}
}