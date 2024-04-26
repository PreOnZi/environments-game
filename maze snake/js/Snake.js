//构造函数
function Snake(){
	//蛇的身体
	this.body = [
		{"x" : 5 , "y" : 11},   //蛇头
		{"x" : 4 , "y" : 11},   //蛇头
		{"x" : 3 , "y" : 11}   //蛇头
	];
	//方向属性
	this.direction = "DOWN";
}
//更新方法,这个方法是每帧执行的
Snake.prototype.update = function(){
	//每帧都要进行方向的判断，然后进行头部的插入操作
	switch(this.direction){
		case "RIGHT":
			//头部插入一项
			this.body.unshift({
				"x" : this.body[0].x,
				"y" : this.body[0].y + 1
			});
			break;
		case "LEFT":
			//头部插入一项
			this.body.unshift({
				"x" : this.body[0].x,
				"y" : this.body[0].y - 1
			});
			break;
		case "UP":
			//头部插入一项
			this.body.unshift({
				"x" : this.body[0].x - 1,
				"y" : this.body[0].y
			});
			break;
		case "DOWN":
			//头部插入一项
			this.body.unshift({
				"x" : this.body[0].x + 1,
				"y" : this.body[0].y
			});
			break;
	}
	//检测一下是不是碰壁了，就是检查你刚刚插入的那项是不是越界了
	if(this.body[0].x < 0 || this.body[0].x > 14 || this.body[0].y < 0 || this.body[0].y > 19){
		alert("碰壁了!你的长度" + (this.body.length - 1));
		g.gameover();
		return false;
	}

	//检测一下即将走到的这个位置是不是已经有蛇的身子了。
	//所以我们要检测一下你刚刚插入的数组第0项是不是也是数组其他项。
	//如果是，就表示蛇头撞到了自己的身体。
	for(var i = 1 ; i < this.body.length ; i++){
		if(this.body[i].x == this.body[0].x && this.body[i].y == this.body[0].y){
			alert("你碰到了自己的身体，死亡！你的长度" + (this.body.length - 1));
			g.gameover();
			return false;
		}
	}

	//如果没有碰到食物，就删除尾巴的那项
	if(this.body[0].x == g.food.x && this.body[0].y == g.food.y){
		//碰到了食物
		//不删除，让g产生新的食物
		g.createNewFood();
	}else{
		//没有碰到食物
		//尾巴删除一项
		var last = this.body.pop();
		//让尾巴这个格格去掉颜色
		g.tds[last.x][last.y].style.backgroundColor = "white";
	}

	return true;
}
//render就是渲染、显示的意思。,这个方法是每帧执行的
Snake.prototype.render = function(){
	//渲染蛇头
	g.tds[this.body[0].x][this.body[0].y].style.backgroundColor = "balck";
	//渲染蛇的其他身体
	for(var i = 1 ; i < this.body.length ; i++){
		g.tds[this.body[i].x][this.body[i].y].style.backgroundColor = "grey";
	}
}