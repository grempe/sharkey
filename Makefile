# Copyright © 2023 Glenn Rempe. All rights reserved.

# These Make commands are called from 'deno task' commands. They are only here since Deno does not support some of the built in commands.
# See : https://deno.land/manual@v1.25.2/tools/task_runner

compress-darwin:
	cd ./build && for i in sharkey-darwin*; do mv $$i sharkey && tar -czf $$i.tar.gz sharkey && rm sharkey; done && cd -

compress-linux:
	cd ./build && for i in sharkey-linux*; do mv $$i sharkey && tar -czf $$i.tar.gz sharkey && rm sharkey; done && cd -
