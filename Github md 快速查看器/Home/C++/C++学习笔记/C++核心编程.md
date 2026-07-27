#CPP #编程笔记
***
## 1.内存分区模型
**C++程序执行时，将内存划分为**【***4个区块***】
- 代码区：存放函数体的二进制代码，由操作系统进行管理的
- 全局区：存放全局变量和静态变量以及常量，程序结束，系统释放
- 栈区：由编译器自动分配释放，存放函数的参数值，局部变量
- 堆区：由程序员分配和释放，诺程序员不释放，程序结束时由操作系统回收
————————————————————————————————————————
**内存四区意义**：
不同区域存放的数据，赋予不同的生命周期，给我们更大的灵魂编程
————————————————————————————————————————
### 1.1 程序运行前
在程序编译后，生成了exe可执行程序，**未执行该程序前**分为两个区域
**代码区**：
- 存放CPU执行的机器指令
- 代码区是**共享**的，共享的目的是对于频繁被执行的程序，只需要在内存中有一份代码即可
- 代码区是只读的，使其只读的原因是防止程序意外的修改了它的指令
**全区域：**
- 全局变量和静态存放在此
- 全局区还包含了常量区，字符串常量和其他常量也存放在此
- **该区域的数据在程序结束后由操作系统释放**
笔记：
- 写在函数内的变量都叫函数变量
- 写在程序之外的是全局变量
- 全局常量，静态变量，字符串常量，全局变量是在一个内存分区（**全局数据区-全局区**）
- 局部变量和局部常量，单独一个内存分区
- 代码分为局部和全局，局部是当结束某个程序时，被系统收回；全局是在程序彻底结束之后被系统收回的
***
### 1.2  程序运行后
**栈区：** 
- 由编译器自动播放，存放函数的参数的参数值，局部变量等
- 注意事项：不要返回局部变量的地址，栈区开辟的数据由编译器自动释放
>【原因：因为局部变量存在栈里，函数一结束栈内存就被系统自动回收，返回的地址就成了指向“已销毁废墟”的野指针】

**堆区：**
- 由程序员分配释放，若程序员不释放，程序结束时由系统回收
- 在C++中主要利用new在堆区开辟内存
笔记：
- 不要重复调用函数的变量，在函数执行完成之后，内存就被释放掉了，但是一次会做保留（x86）
- delete释放的内存只能是new申请了的！delete释放存储在**全局/静态数据区**，不是通过 `new`动态分配的，所以会报错，delete只能释放new申请的堆区数据！
-  new开辟数据之后，你可以指定数据，想什么时候释放就释放，对内存有一定的管理作用
- 普通的int设定是在栈区设定，new int(x);就是开辟到堆区
***
### 1.3 new操作符
**关于new**：
- C++中利用操作符在堆区开辟数据
- 堆区开辟的数据，由程序员手动开辟，手动释放，释放利用操作符delete
- 语法 new 数据类型
- 利用 new 创建的数据，会返回该数据对应的类型的指针
- 在释放数组的时候要加```[]```,比如```delete[] addr```,释放内存
``` C++
#include <iostream>
using namespace std;
//1、new的基本语法
int * func()
{
	//在堆区创建整型数据
	//new返回是 该数据类型的指针
	int * p = new int(10);
	return p;
}

void test1()
{
	int * p = func();
	cout << *p << endl;
	cout << *p << endl;
	//释放代码内存
	delete *p;
	
	cout << *p << endl; //没数据了，就是野指针，因为他指向了不存在的东西，所以是野指针
}
	
int main(){
	test1();
	system("pause");
	return 0;
}
```
***
## 2 引用
### 2.1 引用的基本使用
**作用**：给变量起名
**语法**：```数据类型 &别名 = 原名```
>	注意：数据类型和原名必须要同一个数据类型
>	不管怎么操作，都是修改同一块内存地址

**提示**：指针是提任何大桶水的而发明的提手，引用是桶上自带的把手！
***
### 2.3 引用注意事项
- 引用必须初始化
- 引用在初始化后，不可改变

**列示**：
>	1、引用必须要初始化
>		int &b; //错误的！
>	2、引用一旦初始化后，就不可以更改了
>		int &b = a;
>		int &b = c; //错误的，他已经引用a了
>	3、赋值操作，而不是更改位置
>		int &b = a;
>		int c = 100;
>		b = c; //这个的意思就是a = 100；

***
### 2.3 引用做函数参数
**作用**：函数传参时，可以利用应用的技术让形参修饰实参
**优点**：可以简化指针修改实参
**演示**：
``` C++
#include <iostream>
void mySwap01(int a, int b) {
	int temp = a;
	a = b;
	b = temp;
}

void mySwap02(int *a, int *b) {
	int temp = *a;
	*a = *b;
	*b = temp;
}

int main() {
	//值传递
	int a = 10;
	int b = 20;

	mySwap01(a, b);

	std::cout << "a = " << a << std::endl;
	std::cout << "b = " << b << std::endl;
	
	//地址传递
	mySwap02(&a,&b);

	std::cout << "a = " << a << std::endl;
	std::cout << "b = " << b << std::endl;
}
```
***
### 2.4 引用做函数的返回值

**作用**：引用是可以作为函数的返回值存在的
**注意**：不要返回局部变量引用【因为函数的保留不稳定，所以不行】
- 因为在函数结束后，这个数据已经被释放掉了，再次引用 = 引用野指针
**用法**：函数调用作为[左值](https://zhuanlan.zhihu.com/p/240833006)

列示：
``` C++
#include <iostream>
using namespace std;
//不要引用返回值
int& test01() {
	int a = 10; //局部变量存放在四区中的 栈区
	return a;
}
//2、函数的调用可以作为左值
int& test02() {
	static int a = 10;//静态变量 是放到 【全局区】了
	return a;
}
int main() {
	int& a = test02();
	cout << "a = " << a << endl;
	cout << "a = " << a << endl;
	cout << "a = " << a << endl;
	cout << "a = " << a << endl;
	cout << "a = " << a << endl;
	//不管输出多少次，a都是等于10
}
```
我们还可以把函数引用给进行赋值操作：
``` C++
接上面 ：
test02() = 1000;//test02返回了a的地址，直接在地址上，把数据写成1000；
cout << "a = " << a << endl;
//答案会是1000
```
- 如果函数的返回值是引用，这个函数调用可以作为左值
***
### 2.5 引用的本质
本质：**引用的本质在C++内部实现是一个指针常量**
讲解实列： 
``` C++
//发现是引用，转换为 int* const ref = &a;
#include <iostream>
void func(int& ref) {
	ref = 100; // ref是引用，转换为*ref = 100
}
int main() {
	int a = 10;

	//自动转换为 int* const ref = &a; 指针常量是指针指向不可改，也说明为什么引用不可更改
	int& ref = a;
	ref = 20; //内部发现ref是引用，自动帮我们转换为：*ref = 20;

	std::cout << "a:" << a << std::endl;
	std::cout << "ref:" << ref << std::endl;

	func(a);
	return 0;
}
```
**笔记**：
- &ref = a; 就是 int* const ref = &a;
***
### 2.6 常量引用
**作用**：常量引用主要用来修饰形参，防止误操作
- ==*在函数形参列表中，可以加const修饰形参，防止形参改变实参*==
``` C++
#include <iostream>

void Ceshi(const int& Vc) {
//在引用中加一个↑ const 防止函数调用失误修改
    std::cout << "Vc = " << Vc << std::endl;

}

int main() {

    int Vc = 10;

    Ceshi(Vc);

    return 0;

}
```
***
## 3 函数提高
### 3.1 函数默认
 - 在C++中，函数的形参是可有默认值的
 - 语法：`返回值类型 函数名 （参数 = 默认值){}`

实例：
``` C++
int func(int a, int b = 10, int c = 10){
	return 0;
}

int main (){
	int a = 100;
	int dome = func(a);
	std::cout << "dome = " << dome << std::endl;
	return 0;
}
```

- 在函数当中，函数的默认参数是可以有默认值，而你在没有传入新的参数的时候，就会默认使用默认值进行计算
- 当你传入参数的时候，就默认执行赋值操作：
``` C++
	int func(int a = 100){
		std::cout << "a = " << a;
	}
	int b = func();
	std::cout << b << std::endl; //输出 100
	
	int d = 50;
	int c = func(d)
	std::cout << c << std::endl; //输出 50
```
- 函数在设定默认值的时候，当声明一个默认值时，就要后面的”诛九族“
- 图中"int b = 100"，那么后面的 c , d , e ...，后面的参数都要设置默认值
- 而前面的不用设置
``` C++
	int func(int a, int b = 100, int c = 99 ...)
	{
		 std ...
	}
```
***
### 3.2 函数占位参数
- C++ 中函数的形参列表里可以有占位参数，用来做占位，调用函数时必须填补位置
- **语法**：`返回值类型 函数名 (数据类型){}`

``` C++
#include <iostream>
void func(int a,int)
{
	std::cout << "This is func" << std::endl;
}
int main() {
	func(10,10);
	return 0;
}
```
- 可以使用一个数据类型占位，在引用函数时，要传所有的参才行
***
### 3.3 函数重载
**作用**：函数名可以相同，提高复用性

#### 3.3.1 函数重载概述

**函数重载满足条件**：
- 同一个作用域下
- 函数名称相同
- 函数参数 **类型不同** 或者 **个数不同** 或者 **顺序不变**
- 
**注意**：函数的返回值不可以作为函数重载的条件

``` C++
void func()
{
	std::cout << "func 的调用" << std:endl;
}

void func(int a)
{
	std::cout << "你引入了a !!!" << std::endl;
}

int main(){
	int a = 100;
	func();
	//输出第一个func的函数
	
	func(a);
	//数创第二个func的函数
}
```
***
#### 3.3.2 函数重载的注意事项
``` C++
#inclide <iostream>
using namespace std;

void fun(int &a)
{
	cout << "func(int &a) 调用" << std::endl;
}

void fun (const int &a){
	cout << "func(const int &a) 调用" << std::endl;
}

int main(){
	int a = 10;
	func(a)
	// 调用 a 默认使用上面这个函数体
	
	func(10)
	//调用 10 使用下面这个函数
}
```
- 当函数体的参数上出现const需要使用值进行引用，负责不会执行const
- 写重载函数尽量不要写参数默认值，容易出现二义性报错
***
## 4 类和对象
- C++ 面向对象的三大特征为：==封装、继承、多态==
- C++认为==万事万物都皆为对象==，对象上有其属性和行为

**列如**：
	人可以作为对象，属性有姓名、年龄、身高、体重...，行为有行走、跑、跳、吃饭、唱歌...
	具有相同性质的==对象==，我们可以抽象为==类==，人属于人类，车属于车类
### 4.1 封装
#### 4.1.1 封装的意义

**封装的意义1：**

封装是C++面向对象三大特性之一
封装的意义：
- 将属性和行为作为一个整体，表现生活中的事物
- 将属性和行为加以权限控制

**封装的意义**：
- 在设计类的时候，属性和行为写在一起，表现事物
**语法**：`class 类名{ 访问权限: 属性 / 行为};`
列示：
``` C++
#include <iostream>

//圆周率
const double PI = 3.1415926;

//圆类
class yuan{
    //访问权限_公共权限
    public:
    
    //属性
    int m_r; //半径

  

    //行为
    //获取圆的周长
    double calculateZC(){
        return 2 * PI * m_r;
    }
};

int main(){

    std::cout << "请输入圆的半径：";
    int r = 0;
    std::cin >> r;

    //创建圆对象
    yuan y;
    y.m_r = r;

    //调用成员函数获取圆的周长
    double zc = y.calculateZC();
    std::cout << "圆的周长为：" << zc << std::endl;
    return 0;
}
```

列示2：
设计一个学生类，属性有名字和学号
可以给学生的学号赋值，可以显示学生的名字和学号
``` C++
#include <iostream>
#include <string>
using namespace std;

//设计一个学生类，属性有名字和学号

//可以给学生的学号赋值，可以显示学生的名字和学号
//分析：
//1.学生类
class Student {
    public: //公共访问权限
    //属性
    string m_Name;
    int m_Id = 0;
    int m_Age;

    //行为
    //显示学生信息
    void show() {
        cout << "姓名：" << m_Name << endl;
        cout << "学号：" << m_Id << endl;
        cout << "年龄：" << m_Age << endl;
    }

    //设置学生信息
    void setInfo(string name, int age) {
        m_Name = name;
        m_Age = age;
    }
};

  

//2.主函数
int main() {

    string name = "";
    int age = 0;
    std::cin >> name >> age;
    
    //创建学生对象
    Student s1;
    
    s1.m_Id = 1001; //给学生对象的学号赋值
    
    //给学生对象的属性赋值
    s1.setInfo(name, age);
    
    //显示学生对象的属性
    s1.show();
    
    return 0;

}
```

- **笔记**
- 1、class 可以创建类，类中有属性「成员变量/成员属性」-在主函数中创建对象之后，可以引用
- 2、这个就像带了行为与权限的结构体
- 3、class的成员默认是private（私有，类外不能直接访问）
- 4、struct的成员默认是public（公有，类外可以直接访问）

==后面有讲== class 和 struct 的区别

其他特性（比如能不能继承、能不能有成员函数）几乎完全一致。
之前的代码如果把class换成struct，不用写public:也能直接访问m_Name、m_Id，就是这个原因


**封装的意义2：**
类在设计时，可以把属性的行为放在不同权限下，加以控制
访问权限有三种：

- 1、pubic          公共权限 - 公开的
- 2、protected   保护权限 - 受保护的
- 3、private        私有权限 - 私有的

- **笔记**
- 【公共权限】 成员  类内可以访问  类外可以访问      【这是公开的！】
- 【保护权限】 成员  类内可以访问  类外不可以访问  【子级可访问父级保护内容】
- 【私有权限】 成员  类内可以访问  类外不可以访问  【子级不可访问父级私有内容】

列示：
``` C++
#include <iostream>

//访问权限
//三种
//1.public 公开的
//2.private 私有的
//3.protected 受保护的

class Person{
//公共的 - 公共权限
public:
    std::string m_Name;

//私有的 - 私有权限
private:
    int m_Password;

//受保护的 - 受保护权限
protected:
    std::string m_CarId;

//行为
public: //函数默认是public的访问权限，公开的
    void func(){
        m_Name = "张三";
        m_Password = 123456;
        m_CarId = "粤A88888";
    }
};

  
int main(){
    Person p;
    p.m_Name = "李四";
    //p.m_Password = 654321; 私有权限的内容是在类的外部无法访问的
    //p.m_CarId = "粤B88888"; 受保护权限的内容是在类的外部无法访问的
    p.func();
    return 0;
}
```
***
#### 4.1.2 struct 和 class 区别
在C++中 struct 和 class 唯一的**区别**就在于 **默认是访问权限不同**
区别：
- struct 默认权限为公共
- class  默认权限为私有

``` C++
class C1
{
    int m_A; //默认是 private 【私有权限】
};

struct C2
{
    int m_B; //默认是 public 【公共权限】
}
```

***
#### 4.1.3 成员属性设置为私有
**优点1**：将所有成员属性设置为私有，可以自己控制读写权限
**优点2**：对于写权限，我们可以检测数据的有效性

列示：
``` C++
//成员属性设置私有
#include <iostream>
using namespace std;

class Person {

private: //属性设置为私有
	string m_Nome; //姓名 可读写
	string m_Age; //年龄 只读
	string m_Idol; //偶像 只写
	
public:
	//设置姓名年龄偶像的函数 - 可在外界类修改
	void setPerson(string name,int age ,string Idol)
	{
		m_Name = name;
		m_Age = age;
		m_Idol = Idol;
	}
	//显示姓名年龄偶像的函数
	void Home()
	{
		cout << name << endl;
		cout << age << endl;
		cout << Idol;
	}
};

int main(){
	string name = "";
	string Iodl = "";
	int age = 0;
	
	Person s1;
	// s1.m_Name = "张三"; 错误，属性为私有
    // s1.m_Age = 20; 错误，属性为私有
	s1.setPerson(name,age,Iodl);
	s1.Home();
}
```

列示（结构体版本）：
``` C++
//成员属性设置私有
#include <iostream>
using namespace std;

class Person {

private: //属性设置为私有
        struct PersonInfo
    {
        string m_Name;//姓名
        int m_Age;//年龄
        string m_Idol;//偶像
    };
    PersonInfo m_Info;//创建一个PersonInfo结构体对象

public:
//设置姓名年龄偶像的函数
    void setPerson(string name,int age ,string Idol)
    {
        m_Info.m_Name = name;
        m_Info.m_Age = age;
        m_Info.m_Idol = Idol;
    }

//显示姓名年龄偶像的函数
    void Home()
    {
        cout << m_Info.m_Name << endl;
        cout << m_Info.m_Age << endl;
        cout << m_Info.m_Idol << endl;
    }
};

int main(){
    string name = "";
    string Iodl = "";
    int age = 0;
    cin >> name >> age >> Iodl;
    Person s1;
    // s1.m_Name = "张三"; 错误，属性为私有
    // s1.m_Age = 20; 错误，属性为私有
    s1.setPerson(name,age,Iodl);
    s1.Home();

    // s1.PersonInfo As; //错误，PersonInfo结构体为私有
    // As.name = "李四"; //错误，PersonInfo结构体为私有
}
```
封装的应用：
``` C++
#include <iostream>
class Cube {
    int m_H;
    int m_L;
    int m_W;
public:
    Cube(int h, int l, int w) : m_H(h), m_L(l), m_W(w) {}
    int getVolume() {
        return m_H * m_L * m_W;
    }
    int Volume = getVolume();
//体积
    void printVolume() {
        std::cout << "体积: " << Volume << std::endl;
    }
//面积
    void Area() {
        int surfaceArea = m_L * m_W * 2 + m_L * m_H * 2 + m_W * m_H * 2;
        std::cout << "面积: " << surfaceArea << std::endl;
    }
};

void operator!=(const Cube& c1, const Cube& c2) {
    if (c1.Volume != c2.Volume) {
        std::cout << "体积不相等！" << std::endl;
    } else {
        std::cout << "体积相等！" << std::endl;
    }
}

int main() {
    int H, L, W;
    std::cout << "请输入图形一的长、宽、高: " << std::endl;
    std::cin >> H >> L >> W;
    Cube c1(H, L, W);

    int H2, L2, W2;
    std::cout << "请输入图形二的长、宽、高: " << std::endl;
    std::cin >> H2 >> L2 >> W2;
    Cube c2(H2, L2, W2);

    std::cout << "图形一: " << std::endl;
    c1.printVolume(); //C1体积
    c1.Area(); //C1面积

    std::cout << "图形二：" << std::endl;
    c2.printVolume();//C2体积
    c2.Area();//C2面积

    operator!=(c1, c2); //比较C1和C2的体积
    return 0;
}
```
***
### 4.2 对象的初始化和清理

- 生活中我们买的电子产品都基本会有出厂设置，在莫一天我们不用的时候也会删除一些自己信息数据保证安全
- C++中的面向对象来源于生活，每个对象也都会有初始化以及 对象销毁前的数据清理设置

### 4.3 构造函数的折构函数


