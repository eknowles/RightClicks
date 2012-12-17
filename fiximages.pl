#!/usr/bin/perl
use IO::File;
use File::Spec;
use Image::Size;
use Image::Size 'html_imgsize';
use Data::Dumper;
use Archive::Zip qw(:ERROR_CODES);
use Getopt::Std;

my $zip = Archive::Zip->new();
my $zipName = shift(@ARGV);;
my $status = $zip->read( $zipName );
die "Read of $zipName failed\n" if $status != AZ_OK;

my $dir = 'fixingimages';

(mkdir($dir, 0777) or die "Can't create directory $dir\: $!\n") unless -d $dir;
for my $member ( $zip->members )
{
	
	my $ext = ($member->fileName =~ m/([^.]+)$/)[0];
	if ($member->fileName ne "META-INF/container.xml"){
		if ($ext eq "html" || $ext eq "xhtml" || $ext eq "htm" || $ext eq "xml"){
			($volume,$directories,$filet) = File::Spec->splitpath( $member->fileName);
			$member->extractToFileNamed("fixingimages/Text/".$filet);
			#print "Content File found: ".$member->fileName."\n";	
		}
		
		if ($ext eq "jpg" || $ext eq "jpeg" || $ext eq "gif" || $ext eq "png"){	
			($volume,$directories,$filet) = File::Spec->splitpath( $member->fileName);
			$member->extractToFileNamed("fixingimages/Images/".$filet);
			#print "Image File found: ".$member->fileName."\n";	
		}
	}
}


my @sizes = ();
opendir MYDIRIMG, "fixingimages/Images";
@imgdir= readdir MYDIRIMG;
foreach $file (@imgdir) {
	#print $file."\n";
	if ($file ne "fiximages.pl" && $file ne "." && $file ne "..") {
		($globe_x, $globe_y) = imgsize("fixingimages/Images/".$file);
		if ($globe_x < 600 && $globe_y < 800) {
			#print $globe_x." ".$globe_y."\n";
			$size = html_imgsize("fixingimages/Images/".$file);
			push(@sizes,[$file, $size]);
			#$output .= $file." ".$size."\n";
		}
	}
}

#foreach my $moo (@sizes) {
#	print $moo->[0];	
#}

closedir MYDIRIMG;
#print "\n-----------------------------\n";
opendir MYDIRTEXT, "fixingimages/Text";
@htmls = readdir MYDIRTEXT;

foreach $html_file (@htmls) {
	 my $extdw = ($html_file =~ m/([^.]+)$/)[0];
	 
		$output = "";
	 if ($extdw eq "html" || $extdw eq "xhtml" || $extdw eq "xml" || $extdw eq "htm"){
		 
		# print $html_file."\n";
		open HTMLWTF, "<", "fixingimages/Text/".$html_file or die $!;

		while (my $line = <HTMLWTF>) {
				
			
				foreach $img_wtf (@sizes){
					if ($line =~ m/\/$img_wtf->[0]/){
						my $invar = "/".$img_wtf->[0]."\"";
						#print $invar."\n";
						my $outvar = "/".$img_wtf->[0]."\" ".$img_wtf->[1];
						#print $outvar."\n";
					    $line =~ s/$invar/$outvar/g;
						#print $line."\n";
					}
				#	$line =~ s/$img_wtf->[0]."\""/$img_wtf->[0]."\" ".$img_wtf[1]/g;
#					$line =~ s/$img_wtf->[0]."\""/$img_wtf->[0]."\" ".$img_wtf[1]/g;
				}
				
			$output .= $line;
			}
		
		close HTMLWTF;
		open HTMLROFLS, ">", "fixingimages/Text/".$html_file or die $!;
		print HTMLROFLS $output;
		close HTMLROFLS;
	 }
}
closedir MYDIRTEXT;


#open OUTB, ">output.txt";
#print OUTB $output;
#close OUTB;

