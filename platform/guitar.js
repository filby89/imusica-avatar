function loadGuitar()
{
	var group = new THREE.Object3D();

	var bodyColor = [0.781539, 0.178760, 0.000000, 1.000000];
	var neckColor = [0.030769, 0.016876, 0.016876, 1.000000];
	var rosetteColor = [0.030769, 0.016876, 0.016876, 1.000000];
	var holesColor = [0,0,0];
	loadModel(group, basicVertShaderPath, toonFragShaderPath, bodyColor, THREE.SmoothShading, "models/guitar/body.json");
	loadModel(group, basicVertShaderPath, toonFragShaderPath, neckColor, THREE.SmoothShading, "models/guitar/neck.json");
	loadModel(group, basicVertShaderPath, toonFragShaderPath, rosetteColor, THREE.FlatShading, "models/guitar/rosette.json");
	loadModel(group, basicVertShaderPath, toonFragShaderPath, holesColor, THREE.FlatShading, "models/guitar/holes.json");
	return group;
}