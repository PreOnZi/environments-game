//游戏类
function Game(){
	//这是一个存放所有小格的数组
	this.tds = [];
	//自己的蛇
	this.snake = new Snake();
	//自己的食物
	//等到start的时候才赋予食物
	this.food = null;
	//new出Game类的时候，要执行初始化的操作
	this.init();
	//绑定监听，监听是Game的监听，不是蛇的监听
	this.bindEvent();
}
Game.prototype.init = function(){
	var table = document.getElementsByTagName("table")[0];
	//创建20个tr
	for(var i = 0 ; i < 15 ; i++){
		//创建一个otr
		var otr = document.createElement("tr");
		//临时数组
		var tempArr = [];
		//创建20个td
		for(var j = 0 ; j < 20 ; j++){
			var otd = document.createElement("td");
			//往tr中追加
			otr.appendChild(otd);
			//往临时数组中push
			tempArr.push(otd);
		}
		//temp此时有20个td
		//把temp往mytd中push
		this.tds.push(tempArr);

		//上树，追加到table中
		table.appendChild(otr);
	}
}
//开始游戏方法
Game.prototype.start = function(){
	//帧编号
	this.frame = 0;
	this.snake.render();
	//自己的食物
	this.food = new Food();

	//备份this
	var self = this;
	//定时器
	this.timer = setInterval(function(){
		//更新、显示帧编号
		self.frame ++;
		infoBox.innerHTML = self.frame;
		//每10帧更新蛇、渲染蛇
		if(self.frame % 10 == 0){
			//先更新蛇，然后渲染蛇
			//我们这里是短路语法，因为当sknake碰壁、碰到自己身体的时候，会reutrn false。
			//所以此时后面的render()语句被短路。表示碰壁了、碰到自己了就不用render了。
			self.snake.update() && self.snake.render();
		}
	},20);
}
//绑定监听
Game.prototype.bindEvent = function(){
	//备份this
	var self = this;
	//给document增加监听
	document.onkeydown = function(event){
		event = event || window.event;
		//按下去的键的键码：
		if(event.keyCode == 37 && self.snake.direction != "RIGHT"){
			//按下左键了，但是如果此时是右边，就不理会
			self.snake.direction = "LEFT";
		}else if(event.keyCode == 38 && self.snake.direction != "DOWN"){
			self.snake.direction = "UP";
		}else if(event.keyCode == 39 && self.snake.direction != "LEFT"){
			self.snake.direction = "RIGHT";
		}else if(event.keyCode == 40 && self.snake.direction != "UP"){
			self.snake.direction = "DOWN";
		}
	}
}
//Gameover
Game.prototype.gameover = function(){
	clearInterval(this.timer);
}
//产生新的食物
Game.prototype.createNewFood = function(){
	//清除原来的
	this.tds[this.food.x][this.food.y].innerHTML = "";
	//产生新的
	this.food = new Food();
}
 