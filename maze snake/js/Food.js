//食物类
function Food(){
	// 产生一个位置，并且这个不在蛇身上
	// 不断产生一个位置，直到这个位置不在蛇身上
	while(true){
		//产生一个随机位置
		this.x = parseInt(Math.random() * 15);
		this.y = parseInt(Math.random() * 15);
		//检测在不在蛇的身上
		//我们现在要遍历蛇的身体，一个一个检测产生的食物是不是蛇的某一个身体位置
		for(var i = 0 ; i < g.snake.body.length ; i++){
			if(g.snake.body[i].x == this.x && g.snake.body[i].y == this.y){
				break;
			}
		}
		//检测i的值，就能够知道是不是蛇身体数组中每一个项目都不是这个食物的位置
		if(i == g.snake.body.length){
			break;
		}
	}
		
	// alert("我是food，我被new了");
	g.tds[this.x][this.y].innerHTML = "*";
}