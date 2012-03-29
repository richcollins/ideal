"use strict";
ideal.Importer = ideal.Proto.clone().setType("Importer").newSlots({
	basePath: null,
	addsTimestamp: true,
	seenPaths: []
}).setSlots(
{
	importPaths: function(paths)
	{
		for (var i = 0; i < paths.length; i ++)
		{
			if (this.basePath())
			{
				var path = this.basePath() + "/" + paths[i];
			}
			else
			{
				var path = paths[i];
			}
			
			if (this.seenPaths().indexOf(path) == -1)
			{
				this.seenPaths().push(path);
				
				path = path + ".js";

				var script = '<script type="text/javascript" src="' + path + (this.addsTimestamp() ? ("?" + new Date().getTime()) : "") + '"><\/script>';
				document.write(script);
			}
		}
	}
});
