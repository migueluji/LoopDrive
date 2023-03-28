<!DOCTYPE HTML>
<html>
	<head>
		<style type="text/css">			
			body { background: #222222; }
			canvas { display:block; position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%);} 
		</style>
		<title>Loop Engine</title>
	</head>
	<body>
		<script src="libraries/math.js"></script>
		<script src="https://pixijs.download/v6.1.3/pixi.min.js"></script>
		<script src="libraries/Planck.js"></script>
		<script src="libraries/howler.min.js"></script>

        <script src="Player.js"></script>

		<script src="../core/Game.js"></script>
		<script src="../core/Scene.js"></script>
		<script src="../core/Actor.js"></script>
		<script src="../core/Script.js"></script>
		<script src="../core/Node.js"></script>
		<script src="../core/File.js"></script>
		<script src="../core/Utils.js"></script>
		
        <script src="Physics.js"></script>
        <script src="Input.js"></script>
        <script src="Logic.js"></script>
        <script src="Render.js"></script>        
		<script src="Engine.js"></script>
		
		<script src="GameState.js"></script>
		<script src="GameObject.js"></script>
		<script src="Container.js"></script>
		<script src="Rigidbody.js"></script>
		<script src="Rule.js"></script>
		<script src="Sound.js"></script>

		<script>
			// requestAnimationFrame Polyfill
			var lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o'], x, length, currTime, timeToCall;
    
			for(x = 0, length = vendors.length; x < length && !window.requestAnimationFrame; ++x) {
				window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
				window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
			}
    
		    if (!window.requestAnimationFrame)
				window.requestAnimationFrame = function(callback, element) {
					currTime = new Date().getTime();
					timeToCall = Math.max(0, 16.67 - (currTime - lastTime));
					lastTime = currTime + timeToCall;
					return window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
				};
    
			if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {clearTimeout(id);};
			
			// Game info 
			var serverGamesFolder="<?php echo $_POST['serverGamesFolder'];?>";
			var gameFolder="<?php echo $_POST['gameFolder'];?>";
			var editor=true; /* to kown if the engine has been launched from the editor */

			var player = new Player();
			
		</script>
		<canvas id="main"></canvas>
	</body>
</html>